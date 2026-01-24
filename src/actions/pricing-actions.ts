"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Create a Global Plan (e.g., "3 Months")
export async function createPricingPlan(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const duration = parseInt(formData.get("duration") as string);
  const days = parseInt(formData.get("days") as string);

  if (!name || !duration || !days)
    return { message: "Invalid Data", success: false };

  await prisma.pricingPlan.create({
    data: { name, duration, daysPerWeek: days },
  });

  revalidatePath("/dashboard/payments/settings");
  return { message: "Plan Created", success: true };
}

// 2. Set Price for specific Course + Plan
export async function setCoursePrice(prevState: any, formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const planId = formData.get("planId") as string;
  const amount = parseFloat(formData.get("amount") as string);

  if (!courseId || !planId) return { message: "Missing IDs", success: false };

  await prisma.coursePrice.upsert({
    where: {
      courseId_pricingPlanId: { courseId, pricingPlanId: planId },
    },
    update: { amount },
    create: { courseId, pricingPlanId: planId, amount },
  });

  revalidatePath("/dashboard/payments/settings");
  return { message: "Price Saved", success: true };
}
