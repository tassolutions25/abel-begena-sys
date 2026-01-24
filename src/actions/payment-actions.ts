"use server";

import prisma from "@/lib/prisma";
import { initiateChapaTransaction, verifyChapaTransaction } from "@/lib/chapa";
import { revalidatePath } from "next/cache";

export async function initiateStudentPayment(
  studentId: string,
  amount: number,
  month: number,
  year: number,
  reason: string,
) {
  console.log("--- STARTING PAYMENT INIT ---");
  try {
    // 1. Validate Inputs
    if (amount <= 0)
      return { success: false, message: "Invalid Amount (0 ETB)" };

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) return { success: false, message: "Student not found" };
    if (!student.email)
      return { success: false, message: "Student email is missing" };

    // 2. Generate Reference
    const txRef = `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // 3. Create Internal Record
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

    // 4. SANITIZE DESCRIPTION (Fixing the Colon Error)
    // Remove anything that isn't a Letter, Number, Space, Dot, Hyphen, or Underscore
    const cleanDescription = reason.replace(/[^a-zA-Z0-9 ._-]/g, "");
    // Trim to 15 chars as per previous logic, ensuring it's not empty
    const finalDescription = cleanDescription.substring(0, 15) || "Tuition Fee";

    const payload = {
      amount: amount,
      currency: "ETB",
      email: student.email,
      first_name: student.fullName.split(" ")[0] || "Student",
      last_name: student.fullName.split(" ")[1] || "User",
      tx_ref: txRef,
      callback_url: `${baseUrl}/api/payment/callback`,
      return_url: `${baseUrl}/dashboard/payments/verify?tx_ref=${txRef}`,
      customization: {
        title: "Tuition Payment",
        description: finalDescription, // <--- Now Safe
      },
    };

    console.log("PAYLOAD SENT TO CHAPA:", JSON.stringify(payload, null, 2));

    const chapaResponse = await initiateChapaTransaction(payload);

    console.log("CHAPA RAW RESPONSE:", chapaResponse);

    if (chapaResponse.status !== "success") {
      // FIX [object Object] ERROR: Ensure message is always a string
      let errorMessage = "Chapa Initialization Failed";

      if (typeof chapaResponse.message === "string") {
        errorMessage = chapaResponse.message;
      } else if (typeof chapaResponse.message === "object") {
        // If Chapa returns { "customization.description": ["error"] }
        errorMessage = JSON.stringify(chapaResponse.message);
      }

      return { success: false, message: errorMessage };
    }

    return { success: true, checkoutUrl: chapaResponse.data.checkout_url };
  } catch (e: any) {
    console.error("SYSTEM ERROR:", e);
    return { success: false, message: "Server Error: " + e.message };
  }
}

// ... keep other functions (verifyPaymentAction, etc) ...
export async function verifyPaymentAction(txRef: string) {
  try {
    const result = await verifyChapaTransaction(txRef);
    if (result.status === "success") {
      await prisma.payment.update({
        where: { txRef },
        data: { status: "SUCCESS", chapaTxId: String(result.data.reference) },
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

export async function generateMonthlyPayroll(month: number, year: number) {
  const existing = await prisma.payroll.count({ where: { month, year } });
  if (existing > 0)
    return {
      success: false,
      message: "Payroll already generated for this month.",
    };

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER", isActive: true },
  });

  if (teachers.length === 0)
    return { success: false, message: "No teachers found." };

  const payrolls = teachers.map((t) => ({
    teacherId: t.id,
    amount: t.baseSalary,
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
  await prisma.payroll.update({
    where: { id: payrollId },
    data: { status: "PROCESSED", paidAt: new Date() },
  });

  revalidatePath("/dashboard/payments/payroll");
  return { success: true, message: "Payment Marked as Sent" };
}

// ... Settings actions
export async function updateCoursePrice(prevState: any, formData: FormData) {
  // Legacy placeholder if needed, mostly replaced by pricing-actions
  return { success: true, message: "Use the new settings table." };
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
