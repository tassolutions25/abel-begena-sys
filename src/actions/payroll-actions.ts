"use server";

import prisma from "@/lib/prisma";
import { initiateChapaTransfer, BANK_MAP } from "@/lib/chapa";
import { revalidatePath } from "next/cache";

export async function processBulkPayroll(month: number, year: number) {
  try {
    // 1. Fetch Pending Payrolls
    const pendingPayrolls = await prisma.payroll.findMany({
      where: { month, year, status: "PENDING" },
      include: { teacher: true },
    });

    if (pendingPayrolls.length === 0) {
      return {
        success: false,
        message: "No pending payrolls found for this month.",
      };
    }

    let successCount = 0;
    let failCount = 0;

    // 2. Loop and Pay Each Teacher
    // In a massive system, this would be a background queue. For now, Promise.all is fine.
    const results = await Promise.all(
      pendingPayrolls.map(async (record) => {
        const teacher = record.teacher;

        // NEW VALIDATION: Check for code
        if (!teacher.bankAccountNumber || !teacher.bankCode) {
          console.error(
            `Skipping ${teacher.fullName}: Missing Bank Code or Account`,
          );
          return { success: false };
        }

        const transferRef = `SALARY-${year}-${month}-${teacher.id.substring(0, 5)}`;

        const transferRes = await initiateChapaTransfer({
          account_name: teacher.fullName,
          account_number: teacher.bankAccountNumber,
          amount: record.amount,
          currency: "ETB",
          bank_code: teacher.bankCode, // <--- USE DYNAMIC CODE FROM DB
          reference: transferRef,
        });

        if (transferRes.status === "success") {
          // Update DB to PROCESSED
          await prisma.payroll.update({
            where: { id: record.id },
            data: {
              status: "PROCESSED",
              paidAt: new Date(),
              transferRef: transferRes.data?.reference || transferRef,
            },
          });
          return { success: true };
        } else {
          console.error(
            `Transfer Failed for ${teacher.fullName}:`,
            transferRes.message,
          );
          return { success: false };
        }
      }),
    );

    // 3. Summarize Results
    results.forEach((r) => (r.success ? successCount++ : failCount++));

    revalidatePath("/dashboard/payments/payroll");

    return {
      success: true,
      message: `Payout Complete. Success: ${successCount}, Failed: ${failCount}`,
    };
  } catch (e: any) {
    console.error("PAYROLL ERROR:", e);
    return { success: false, message: "System Error during payout." };
  }
}

export async function generateMonthlyPayroll(month: number, year: number) {
  // 1. Get all Active Teachers
  const activeTeachers = await prisma.user.findMany({
    where: { role: "TEACHER", isActive: true },
  });

  if (activeTeachers.length === 0)
    return { success: false, message: "No active teachers found." };

  // 2. Get IDs of teachers who ALREADY have a payroll entry for this month
  const existingRecords = await prisma.payroll.findMany({
    where: { month, year },
    select: { teacherId: true },
  });

  const existingTeacherIds = new Set(existingRecords.map((r) => r.teacherId));

  // 3. Filter: Find teachers who DO NOT have a record yet
  const missingTeachers = activeTeachers.filter(
    (t) => !existingTeacherIds.has(t.id),
  );

  if (missingTeachers.length === 0) {
    return { success: true, message: "Payroll list is already up to date." };
  }

  // 4. Create records ONLY for the missing teachers
  const newPayrolls = missingTeachers.map((t) => ({
    teacherId: t.id,
    amount: t.baseSalary,
    month,
    year,
    status: "PENDING" as const,
  }));

  await prisma.payroll.createMany({ data: newPayrolls });

  revalidatePath("/dashboard/payments/payroll");
  return {
    success: true,
    message: `Added ${newPayrolls.length} new teachers to the payroll.`,
  };
}
