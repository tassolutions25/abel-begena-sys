"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// --- 1. TEACHER SHIFT MANAGEMENT ---
export async function createTeacherShift(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  if (!name || !startTime || !endTime)
    return { message: "All fields required", success: false };

  await prisma.teacherShift.create({
    data: { name, startTime, endTime },
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

  await prisma.teacherShift.update({
    where: { id },
    data: { name, startTime, endTime },
  });
  revalidatePath("/dashboard/teachers/shifts");
  return { message: "Shift Updated", success: true };
}

// --- 3. TEACHER CLOCK-IN (Attendance) ---
export async function teacherClockIn(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Check if record exists
    const existing = await prisma.teacherAttendance.findUnique({
      where: { date_userId: { date: today, userId } },
    });

    if (existing) return { message: "Already clocked in.", success: false };

    await prisma.teacherAttendance.create({
      data: {
        date: today,
        userId,
        status: "PRESENT",
        checkIn: new Date(), // NOW
      },
    });

    revalidatePath("/teacher-portal");
    return { message: "Clocked In Successfully!", success: true };
  } catch (e) {
    return { message: "Error clocking in.", success: false };
  }
}

export async function teacherClockOut(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Find today's record
    const record = await prisma.teacherAttendance.findUnique({
      where: { date_userId: { date: today, userId } },
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
  formData: FormData
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
