"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { DayOfWeek } from "@prisma/client";

// --- 1. TEACHER SHIFT MANAGEMENT ---

export async function createTeacherShift(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  // Get all checked checkboxes
  const workDays = formData.getAll("workDays") as DayOfWeek[];

  if (!name || !startTime || !endTime)
    return { message: "Name and Time fields required", success: false };

  if (workDays.length === 0)
    return {
      message: "Please select at least one working day",
      success: false,
    };

  await prisma.teacherShift.create({
    data: { name, startTime, endTime, workDays },
  });

  revalidatePath("/dashboard/teachers/shifts");
  return { message: "Work Shift Created", success: true };
}

// --- 2. REGISTER TEACHER ---
const TeacherSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(9),
  branchId: z.string().min(1),
  teacherShiftId: z.string().min(1),
});

export async function registerTeacher(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validated = TeacherSchema.safeParse(rawData);

    if (!validated.success) return { message: "Invalid Data", success: false };
    const { fullName, email, password, phone, branchId, teacherShiftId } =
      validated.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        branchId,
        teacherShiftId,
        password: hashedPassword,
        role: "TEACHER", // Force Role
      },
    });

    revalidatePath("/dashboard/teachers");
    return { message: "Teacher Registered Successfully!", success: true };
  } catch (e) {
    return { message: "Error: Email might be in use.", success: false };
  }
}

export async function deleteTeacherShift(id: string) {
  try {
    const count = await prisma.user.count({ where: { teacherShiftId: id } });
    if (count > 0)
      return {
        message: "Cannot delete: Teachers are assigned to this shift.",
        success: false,
      };

    await prisma.teacherShift.delete({ where: { id } });
    revalidatePath("/dashboard/teachers/shifts");
    return { message: "Shift Deleted", success: true };
  } catch (e) {
    return { message: "Error deleting shift", success: false };
  }
}

export async function updateTeacherShift(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const workDays = formData.getAll("workDays") as DayOfWeek[];

  if (workDays.length === 0)
    return {
      message: "Please select at least one working day",
      success: false,
    };

  await prisma.teacherShift.update({
    where: { id },
    data: { name, startTime, endTime, workDays },
  });

  revalidatePath("/dashboard/teachers/shifts");
  return { message: "Shift Updated", success: true };
}

// --- 3. TEACHER CLOCK-IN (Attendance) ---
export async function teacherClockIn(
  userId: string,
  currentLat: number,
  currentLng: number,
) {
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  try {
    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      include: { branch: true },
    });

    if (!teacher || !teacher.branch)
      return { message: "Teacher not assigned to a branch.", success: false };

    // 1. GEO-FENCING LOGIC
    if (teacher.branch.latitude && teacher.branch.longitude) {
      // Ensure frontend sent valid coords
      if (!currentLat || !currentLng) {
        return {
          message: "Location data missing. Enable GPS.",
          success: false,
        };
      }

      const distance = getDistanceFromLatLonInMeters(
        currentLat,
        currentLng,
        teacher.branch.latitude,
        teacher.branch.longitude,
      );

      console.log(
        `Clock In Attempt: Teacher is ${Math.round(distance)}m away from branch.`,
      );

      if (distance > MAX_DISTANCE_METERS) {
        return {
          message: `You are too far! You are ${Math.round(distance)}m away. Move closer to ${teacher.branch.name}.`,
          success: false,
        };
      }
    } else {
      // Optional: If branch has NO coordinates set, do we allow it?
      // Let's allow it but warn the admin in logs, or block it.
      // For now, allow it to prevent system lockout during setup.
      console.log("Branch has no coordinates. Skipping Geo-Check.");
    }

    // 2. CHECK EXISTING RECORD
    const existing = await prisma.teacherAttendance.findUnique({
      where: { date_userId: { date: todayUTC, userId } },
    });

    if (existing) return { message: "Already clocked in.", success: false };

    // 3. SUCCESS
    await prisma.teacherAttendance.create({
      data: {
        date: todayUTC,
        userId,
        status: "PRESENT",
        checkIn: new Date(),
      },
    });

    revalidatePath("/teacher-portal");
    return { message: "Clocked In Successfully!", success: true };
  } catch (e) {
    console.error(e);
    return { message: "Error clocking in.", success: false };
  }
}

export async function teacherClockOut(userId: string) {
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);

  try {
    // Find today's record
    const record = await prisma.teacherAttendance.findUnique({
      where: { date_userId: { date: todayUTC, userId } },
    });

    if (!record)
      return { message: "You haven't clocked in yet!", success: false };
    if (record.checkOut)
      return { message: "Already clocked out.", success: false };

    await prisma.teacherAttendance.update({
      where: { id: record.id },
      data: { checkOut: new Date() }, // NOW
    });

    revalidatePath("/teacher-portal");
    return { message: "Clocked Out. Good job!", success: true };
  } catch (e) {
    return { message: "Error clocking out.", success: false };
  }
}

export async function adminUpdateAttendance(
  prevState: any,
  formData: FormData,
) {
  const id = formData.get("id") as string;
  const checkInStr = formData.get("checkIn") as string; // "HH:MM"
  const checkOutStr = formData.get("checkOut") as string; // "HH:MM"

  // Helper to merge Time string with Record Date
  const record = await prisma.teacherAttendance.findUnique({ where: { id } });
  if (!record) return { message: "Record not found", success: false };

  const baseDate = new Date(record.date);

  // Set CheckIn Time
  const [inH, inM] = checkInStr.split(":");
  const newCheckIn = new Date(baseDate);
  newCheckIn.setHours(parseInt(inH), parseInt(inM));

  // Set CheckOut Time (if provided)
  let newCheckOut = null;
  if (checkOutStr) {
    const [outH, outM] = checkOutStr.split(":");
    newCheckOut = new Date(baseDate);
    newCheckOut.setHours(parseInt(outH), parseInt(outM));
  }

  await prisma.teacherAttendance.update({
    where: { id },
    data: { checkIn: newCheckIn, checkOut: newCheckOut },
  });

  revalidatePath("/dashboard/teachers/attendance");
  return { message: "Attendance Log Updated", success: true };
}
export async function updateTeacher(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const branchId = formData.get("branchId") as string;
  const teacherShiftId = formData.get("teacherShiftId") as string;

  try {
    await prisma.user.update({
      where: { id },
      data: { fullName, email, phone, branchId, teacherShiftId },
    });
    revalidatePath("/dashboard/teachers");
    revalidatePath(`/dashboard/teachers/${id}`);
    return { message: "Teacher Updated Successfully", success: true };
  } catch (e) {
    return { message: "Error updating teacher", success: false };
  }
}

// --- 5. ADMIN MANUALLY ADD ATTENDANCE ---
export async function adminManualAttendance(
  prevState: any,
  formData: FormData,
) {
  const userId = formData.get("userId") as string;
  const dateStr = formData.get("date") as string;
  const checkInStr = formData.get("checkIn") as string; // "HH:MM"
  const checkOutStr = formData.get("checkOut") as string; // "HH:MM"

  try {
    const date = new Date(dateStr);

    // Construct Date objects for Time
    const checkIn = new Date(dateStr + "T" + checkInStr);

    let checkOut = null;
    if (checkOutStr) {
      checkOut = new Date(dateStr + "T" + checkOutStr);
    }

    // Check if record exists
    const existing = await prisma.teacherAttendance.findUnique({
      where: { date_userId: { date, userId } },
    });

    if (existing)
      return {
        message: "Attendance record already exists for this date.",
        success: false,
      };

    await prisma.teacherAttendance.create({
      data: {
        date,
        userId,
        status: "PRESENT",
        checkIn,
        checkOut,
      },
    });

    revalidatePath("/dashboard/teachers/attendance");
    return { message: "Attendance Added Manually", success: true };
  } catch (e) {
    return { message: "Error adding attendance", success: false };
  }
}

function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // Radius of earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d * 1000; // Meters
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// MAX DISTANCE ALLOWED (e.g., 300 meters)
const MAX_DISTANCE_METERS = 300;

export async function resumeShift(formData: FormData) {
  const attendanceId = formData.get("attendanceId") as string;

  await prisma.teacherAttendance.update({
    where: { id: attendanceId },
    data: { checkOut: null }, // Clear the checkout time
  });

  revalidatePath("/teacher-portal");
}
