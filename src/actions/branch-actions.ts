"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BranchSchema = z.object({
  name: z.string().min(2, "Branch name is required"),
  location: z.string().min(2, "Location is required"),
  currency: z.enum(["ETB", "USD"]),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export async function createBranch(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validated = BranchSchema.safeParse(rawData);

    if (!validated.success) {
      return { message: "Validation Error: Check inputs", success: false };
    }

    const { name, location, currency, latitude, longitude } = validated.data;

    await prisma.branch.create({
      data: {
        name,
        location,
        currency,
        // Only save if they are valid numbers (not 0 or null unless intended)
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/branches");
    return { message: "New Branch Created Successfully!", success: true };
  } catch (error) {
    return {
      message: "Database Error: Could not create branch.",
      success: false,
    };
  }
}

export async function updateBranchLocation(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  // Convert string to float
  const latitude = parseFloat(formData.get("latitude") as string);
  const longitude = parseFloat(formData.get("longitude") as string);

  if (isNaN(latitude) || isNaN(longitude))
    return { message: "Invalid Coordinates", success: false };

  await prisma.branch.update({
    where: { id },
    data: { latitude, longitude },
  });

  revalidatePath("/dashboard/branches");
  return { message: "Location Updated", success: true };
}
