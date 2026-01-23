"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// 1. UPDATE SCHEMA: Make branchId optional
const UserSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
  // Allow all roles
  role: z.enum(["ADMIN", "SUPER_ADMIN", "TEACHER", "STUDENT"]),
  // Branch is now optional because Admins might not have one
  branchId: z.string().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export async function createUser(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = UserSchema.safeParse(rawData);

    if (!validatedFields.success) {
      // Return specific validation errors
      return {
        message: "Validation Error: Check all fields.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { fullName, email, password, role, branchId, phone } =
      validatedFields.data;

    // 2. LOGIC CHECK: Students MUST have a branch
    if (role === "STUDENT" && !branchId) {
      return {
        message: "Students must be assigned to a branch.",
        success: false,
      };
    }

    // 3. HANDLE BRANCH (Only if provided)
    if (branchId) {
      const existingBranch = await prisma.branch.findUnique({
        where: { id: branchId },
      });

      // Auto-create branch if missing (Only if ID was actually provided)
      if (!existingBranch) {
        await prisma.branch.create({
          data: {
            id: branchId,
            name: "New Branch",
            location: "Unknown",
            currency: "ETB",
          },
        });
      }
    }

    // 4. HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. CREATE USER
    await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: role as any,
        // If branchId is empty string or undefined, save as null
        branchId: branchId || null,
        phone: phone || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admins"); // Refresh admin list
    revalidatePath("/dashboard/students");

    return { message: "User registered successfully!", success: true };
  } catch (error: any) {
    console.error("REGISTRATION ERROR:", error);
    if (error.code === "P2002") {
      return { message: "This email is already registered.", success: false };
    }
    return { message: "System Error during registration.", success: false };
  }
}
