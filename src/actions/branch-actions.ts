"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BranchSchema = z.object({
  name: z.string().min(2, "Branch name is required"),
  location: z.string().min(2, "Location is required"),
  currency: z.enum(["ETB", "USD"]),
});

export async function createBranch(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validated = BranchSchema.safeParse(rawData);

    if (!validated.success) {
      return { message: "Validation Error", success: false };
    }

    await prisma.branch.create({
      data: validated.data,
    });

    revalidatePath("/dashboard");
    return { message: "New Branch Created Successfully!", success: true };
  } catch (error) {
    return {
      message: "Database Error: Could not create branch.",
      success: false,
    };
  }
}
