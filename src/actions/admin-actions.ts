"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

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
    const file = formData.get("avatar") as File;
    let avatarPath = null;

    if (file && file.size > 0) {
      // Upload to Vercel Blob (Free Cloud Storage)
      const blob = await put(file.name, file, {
        access: "public",
      });
      avatarPath = blob.url; // This gives a real internet URL
    }

    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = UserSchema.safeParse({
      fullName: rawData.fullName,
      email: rawData.email,
      password: rawData.password,
      role: rawData.role,
      branchId: rawData.branchId,
      phone: rawData.phone,
    });

    if (!validatedFields.success) {
      return {
        message: "Validation Error",
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
        branchId: branchId || null,
        phone: phone || null,
        avatar: avatarPath,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admins");
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
