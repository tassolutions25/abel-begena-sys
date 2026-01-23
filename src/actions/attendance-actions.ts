"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitAttendance(
  date: string,
  attendanceData: Record<string, string>,
) {
  const formattedDate = new Date(date);

  try {
    // Process all updates in parallel for speed
    await prisma.$transaction(
      Object.entries(attendanceData).map(([enrollmentId, status]) => {
        return prisma.attendance.upsert({
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
            recordedBy: "ADMIN",
          },
        });
      }),
    );

    revalidatePath("/dashboard/attendance");
    return { success: true, message: "Attendance Saved" };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Error saving attendance" };
  }
}
