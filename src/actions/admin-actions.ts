"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

const UserSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  branchId: z.string().min(1, "Branch is required"),
});

export async function createUser(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = UserSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        message: "Validation Error",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { fullName, email, password, role, branchId } = validatedFields.data;

    // 1. Check if Branch exists, if not, CREATE IT (Auto-fix for setup)
    const existingBranch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!existingBranch) {
      console.log(`Branch ${branchId} not found. Creating it automatically...`);
      await prisma.branch.create({
        data: {
          id: branchId,
          name:
            branchId === "chicago-main"
              ? "Chicago Branch"
              : "Addis Ababa Branch",
          location:
            branchId === "chicago-main" ? "Chicago, USA" : "Addis Ababa, ET",
          currency: branchId === "chicago-main" ? "USD" : "ETB",
        },
      });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User
    await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: role as any,
        branchId,
      },
    });

    revalidatePath("/dashboard");
    return { message: "User created successfully!", success: true };
  } catch (error: any) {
    // Log the ACTUAL error to your VS Code terminal
    console.error("REGISTRATION ERROR:", error);

    // Check for specific error types
    if (error.code === "P2002") {
      return { message: "This email is already registered.", success: false };
    }

    return {
      message: "System Error: Check server logs for details.",
      success: false,
    };
  }
}
