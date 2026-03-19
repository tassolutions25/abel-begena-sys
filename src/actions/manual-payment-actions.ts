"use server";

import prisma from "@/lib/prisma";
import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function submitManualPayment(formData: FormData) {
  try {
    const studentId = formData.get("studentId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const monthsStr = formData.get("months") as string; // JSON string of months
    const year = parseInt(formData.get("year") as string);
    const file = formData.get("receipt") as File;
    const planName = formData.get("planName") as string;

    if (!file || file.size === 0)
      return { success: false, message: "Receipt is required" };

    // 1. Upload Receipt
    const blob = await put(`receipts/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    const months = JSON.parse(monthsStr) as number[]; // e.g., [9, 10, 11]

    // --- NEW VALIDATION CHECK ---
    const existingPayments = await prisma.payment.findFirst({
      where: {
        studentId,
        year,
        month: { in: months },
        status: { in: ["SUCCESS", "PENDING"] },
      },
    });

    if (existingPayments) {
      return {
        success: false,
        message: `Submission failed: You have already paid or submitted a receipt for Month ${existingPayments.month}.`,
      };
    }

    // 2. Create a Payment record for EACH month selected
    // This allows the admin to see exactly which months are being paid for
    const txGroupRef = `MAN-${Date.now()}`;

    await Promise.all(
      months.map((m) =>
        prisma.payment.create({
          data: {
            studentId,
            amount: amount / months.length, // Split total by months or keep total
            month: m,
            year,
            reason: `Manual Payment - ${planName}`,
            method: "MANUAL",
            receiptUrl: blob.url,
            status: "PENDING",
            txRef: `${txGroupRef}-${m}`,
          },
        }),
      ),
    );

    revalidatePath("/student-portal");
    return { success: true, message: "Receipt submitted for approval!" };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Error submitting payment." };
  }
}

export async function rejectManualPayment(paymentId: string) {
  try {
    // 1. Find the payment to get the receipt URL
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) return { success: false, message: "Payment not found" };

    // 2. Delete the file from Vercel Blob (if it exists)
    if (payment.receiptUrl) {
      await del(payment.receiptUrl);
    }

    // 3. Delete the record from the Database
    await prisma.payment.delete({
      where: { id: paymentId },
    });

    revalidatePath("/dashboard/payments/approvals");
    revalidatePath("/student-portal");

    return { success: true, message: "Payment rejected and record deleted." };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Error rejecting payment." };
  }
}

export async function approveManualPayment(paymentIds: string[]) {
  try {
    await prisma.payment.updateMany({
      where: { id: { in: paymentIds } },
      data: { status: "SUCCESS" },
    });
    revalidatePath("/dashboard/payments");
    return { success: true, message: "Payments Approved!" };
  } catch (e) {
    return { success: false, message: "Approval failed." };
  }
}
