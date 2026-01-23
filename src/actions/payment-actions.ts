"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { initiateChapaTransaction, verifyChapaTransaction } from "@/lib/chapa";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- 1. SETTINGS (Admin sets prices/salaries) ---

export async function updateCoursePrice(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  const price = parseFloat(formData.get("price") as string);

  await prisma.course.update({ where: { id }, data: { monthlyPrice: price } });
  revalidatePath("/dashboard/payments/settings");
  return { message: "Price Updated", success: true };
}

export async function updateTeacherFinancials(
  prevState: any,
  formData: FormData,
) {
  const id = formData.get("id") as string;
  const salary = parseFloat(formData.get("salary") as string);
  const bankName = formData.get("bankName") as string;
  const account = formData.get("account") as string;

  await prisma.user.update({
    where: { id },
    data: { baseSalary: salary, bankName, bankAccountNumber: account },
  });
  revalidatePath("/dashboard/payments/settings");
  return { message: "Teacher Financials Updated", success: true };
}

// --- 2. STUDENT PAYMENT (INFLOW) ---

export async function initiateStudentPayment(
  studentId: string,
  amount: number,
  month: number,
  year: number,
  reason: string,
) {
  try {
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) return { success: false, message: "Student not found" };

    // 1. Create Internal Record (PENDING)
    const txRef = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await prisma.payment.create({
      data: {
        studentId,
        amount,
        month,
        year,
        reason,
        txRef,
        status: "PENDING",
      },
    });

    // 2. Call Chapa
    const chapaResponse = await initiateChapaTransaction({
      amount,
      currency: "ETB",
      email: student.email,
      first_name: student.fullName.split(" ")[0],
      last_name: student.fullName.split(" ")[1] || "",
      tx_ref: txRef,
      // In production, use a real domain. For localhost, verify manually on return page.
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/payments/verify?tx_ref=${txRef}`,
      customization: {
        title: "Abel Begena Tuition",
        description: reason,
      },
    });

    if (chapaResponse.status !== "success") {
      return { success: false, message: "Chapa Initialization Failed" };
    }

    return { success: true, checkoutUrl: chapaResponse.data.checkout_url };
  } catch (e) {
    console.error(e);
    return { success: false, message: "System Error" };
  }
}

export async function verifyPaymentAction(txRef: string) {
  try {
    // 1. Check Chapa
    const result = await verifyChapaTransaction(txRef);

    if (result.status === "success") {
      // 2. Update DB
      await prisma.payment.update({
        where: { txRef },
        data: { status: "SUCCESS", chapaTxId: result.data.reference },
      });
      revalidatePath("/dashboard/payments");
      return { success: true, message: "Payment Verified Successfully!" };
    } else {
      await prisma.payment.update({
        where: { txRef },
        data: { status: "FAILED" },
      });
      return { success: false, message: "Payment Failed or Pending." };
    }
  } catch (e) {
    return { success: false, message: "Verification Error" };
  }
}

// --- 3. TEACHER PAYROLL (OUTFLOW) ---

export async function generateMonthlyPayroll(month: number, year: number) {
  // 1. Check if payroll already run for this month
  const existing = await prisma.payroll.count({ where: { month, year } });
  if (existing > 0)
    return {
      success: false,
      message: "Payroll already generated for this month.",
    };

  // 2. Get active teachers
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER", isActive: true },
  });

  if (teachers.length === 0)
    return { success: false, message: "No teachers found." };

  // 3. Create Payroll Records
  const payrolls = teachers.map((t) => ({
    teacherId: t.id,
    amount: t.baseSalary, // In future, calculate based on attendance
    month,
    year,
    status: "PENDING" as const,
  }));

  await prisma.payroll.createMany({ data: payrolls });

  revalidatePath("/dashboard/payments/payroll");
  return {
    success: true,
    message: `Payroll Generated for ${teachers.length} teachers.`,
  };
}

export async function processTeacherPayment(payrollId: string) {
  // In a real banking API, this is where we send money.
  // For now, we simulate the "System paying by itself".

  await prisma.payroll.update({
    where: { id: payrollId },
    data: { status: "PROCESSED", paidAt: new Date() },
  });

  revalidatePath("/dashboard/payments/payroll");
  return { success: true, message: "Payment Marked as Sent" };
}
