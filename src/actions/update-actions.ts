"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- BRANCH UPDATE ---
const BranchSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  location: z.string().min(2),
  currency: z.enum(["ETB", "USD"]),
});

export async function updateBranch(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validated = BranchSchema.safeParse(rawData);

    if (!validated.success)
      return { message: "Validation failed", success: false };

    await prisma.branch.update({
      where: { id: validated.data.id },
      data: {
        name: validated.data.name,
        location: validated.data.location,
        currency: validated.data.currency,
      },
    });

    revalidatePath("/dashboard/branches");
    return { message: "Branch updated successfully!", success: true };
  } catch (error) {
    return { message: "Database Error: Could not update.", success: false };
  }
}

// --- STUDENT UPDATE ---
const StudentSchema = z.object({
  id: z.string(),
  fullName: z.string().min(2),
  email: z.string().email(),
  branchId: z.string().min(1),
  phone: z.string().optional(),
});

export async function updateStudent(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validated = StudentSchema.safeParse(rawData);

    if (!validated.success)
      return { message: "Validation failed", success: false };

    await prisma.user.update({
      where: { id: validated.data.id },
      data: {
        fullName: validated.data.fullName,
        email: validated.data.email,
        phone: validated.data.phone,
        branchId: validated.data.branchId,
      },
    });

    revalidatePath("/dashboard/students");
    return { message: "Student updated successfully!", success: true };
  } catch (error) {
    return { message: "Database Error: Could not update.", success: false };
  }
}
