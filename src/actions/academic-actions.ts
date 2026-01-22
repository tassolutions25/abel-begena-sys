"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DayOfWeek, ProgramType } from "@prisma/client";

const ShiftSchema = z.object({
  name: z.string().min(1),
  startTime: z.string(),
  endTime: z.string(),
});

export async function createShift(prevState: any, formData: FormData) {
  const data = ShiftSchema.safeParse(Object.fromEntries(formData));
  if (!data.success) return { message: "Invalid Data", success: false };

  await prisma.shift.create({ data: data.data });
  revalidatePath("/dashboard/academics");
  return { message: "Shift Created", success: true };
}

export async function createCourse(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { message: "Name required", success: false };

  await prisma.course.create({ data: { name } });
  revalidatePath("/dashboard/academics");
  return { message: "Course Created", success: true };
}

export async function enrollStudent(prevState: any, formData: FormData) {
  try {
    const studentId = formData.get("studentId") as string;
    const courseId = formData.get("courseId") as string;
    const shiftId = formData.get("shiftId") as string;
    const programType = formData.get("programType") as ProgramType;

    // Get all checked days from form data
    const selectedDays = formData.getAll("days") as DayOfWeek[];

    // 1. Validate Day Count based on Program
    if (programType === "THREE_MONTHS" && selectedDays.length !== 5) {
      return {
        message: "3-Month Program requires exactly 5 days.",
        success: false,
      };
    }
    if (programType === "SIX_MONTHS" && selectedDays.length !== 3) {
      return {
        message: "6-Month Program requires exactly 3 days.",
        success: false,
      };
    }
    if (programType === "NINE_MONTHS" && selectedDays.length !== 2) {
      return {
        message: "9-Month Program requires exactly 2 days.",
        success: false,
      };
    }

    if (selectedDays.length === 0) {
      return { message: "Please select learning days.", success: false };
    }

    // 2. Save to DB
    await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        shiftId,
        programType,
        selectedDays,
      },
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return { message: "Student Enrolled Successfully!", success: true };
  } catch (e) {
    console.error(e);
    return { message: "Error enrolling student.", success: false };
  }
}

export async function updateCourse(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;

  if (!name) return { message: "Name required", success: false };

  await prisma.course.update({ where: { id }, data: { name } });
  revalidatePath("/dashboard/academics");
  return { message: "Course Updated", success: true };
}

export async function deleteCourse(id: string) {
  try {
    // Check for enrollments
    const count = await prisma.enrollment.count({ where: { courseId: id } });
    if (count > 0)
      return {
        message: "Cannot delete: Students are enrolled in this class.",
        success: false,
      };

    await prisma.course.delete({ where: { id } });
    revalidatePath("/dashboard/academics");
    return { message: "Course Deleted", success: true };
  } catch (e) {
    return { message: "Error deleting course", success: false };
  }
}

// --- SHIFT ACTIONS ---
export async function updateShift(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  await prisma.shift.update({
    where: { id },
    data: { name, startTime, endTime },
  });
  revalidatePath("/dashboard/academics");
  return { message: "Shift Updated", success: true };
}

export async function deleteShift(id: string) {
  try {
    const count = await prisma.enrollment.count({ where: { shiftId: id } });
    if (count > 0)
      return {
        message: "Cannot delete: Students are enrolled in this shift.",
        success: false,
      };

    await prisma.shift.delete({ where: { id } });
    revalidatePath("/dashboard/academics");
    return { message: "Shift Deleted", success: true };
  } catch (e) {
    return { message: "Error deleting shift", success: false };
  }
}

export async function updateEnrollment(prevState: any, formData: FormData) {
  try {
    const enrollmentId = formData.get("enrollmentId") as string;
    const shiftId = formData.get("shiftId") as string;
    const programType = formData.get("programType") as ProgramType;
    // Get all checked days
    const selectedDays = formData.getAll("days") as DayOfWeek[];

    // 1. Validate Day Count based on Program Logic
    if (programType === "THREE_MONTHS" && selectedDays.length !== 5) {
      return {
        message: "3-Month Program requires exactly 5 days.",
        success: false,
      };
    }
    if (programType === "SIX_MONTHS" && selectedDays.length !== 3) {
      return {
        message: "6-Month Program requires exactly 3 days.",
        success: false,
      };
    }
    if (programType === "NINE_MONTHS" && selectedDays.length !== 2) {
      return {
        message: "9-Month Program requires exactly 2 days.",
        success: false,
      };
    }

    // 2. Update Database
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        shiftId,
        programType,
        selectedDays,
      },
    });

    // Revalidate the student details page
    revalidatePath("/dashboard/students/[id]", "page");
    return { message: "Enrollment Updated Successfully!", success: true };
  } catch (e) {
    return { message: "Error updating enrollment.", success: false };
  }
}

// --- ENROLLMENT ACTION ---
export async function deleteEnrollment(id: string) {
  try {
    await prisma.enrollment.delete({ where: { id } });
    // We revalidate the specific student page and the dashboard
    revalidatePath("/dashboard/students/[id]", "page");
    return { message: "Student un-enrolled", success: true };
  } catch (e) {
    return { message: "Error un-enrolling student", success: false };
  }
}
