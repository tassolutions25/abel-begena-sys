"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBank(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;

  if (!name || !code)
    return { success: false, message: "Name and Code required" };

  await prisma.bank.create({
    data: { name, code },
  });

  revalidatePath("/dashboard/payments/settings");
  return { success: true, message: "Bank Added Successfully" };
}

export async function deleteBank(id: string) {
  try {
    await prisma.bank.delete({ where: { id } });
    revalidatePath("/dashboard/payments/settings");
    return { success: true, message: "Bank Deleted" };
  } catch (e) {
    return { success: false, message: "Error deleting bank" };
  }
}
