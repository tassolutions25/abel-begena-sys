"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitAttendance(
  date: string,
  attendanceData: Record<string, string>
) {
  // attendanceData is { "enrollment_id": "PRESENT", ... }

  const formattedDate = new Date(date);

  for (const [enrollmentId, status] of Object.entries(attendanceData)) {
    await prisma.attendance.upsert({
      where: {
        date_enrollmentId: {
          date: formattedDate,
          enrollmentId: enrollmentId,
        },
      },
      update: { status: status as any },
      create: {
        date: formattedDate,
        enrollmentId,
        status: status as any,
        recordedBy: "ADMIN", // In real app, use session user ID
      },
    });
  }

  revalidatePath("/dashboard/attendance");
  return { success: true, message: "Attendance Saved" };
}
