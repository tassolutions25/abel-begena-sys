"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAction(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validated = LoginSchema.safeParse(rawData);

  if (!validated.success) {
    return { message: "Invalid email or password format", success: false };
  }

  const { email, password } = validated.data;
  let userRole = ""; // Variable to store role for redirecting

  try {
    console.log(`Attempting login for: ${email}`); // Debug Log

    // 1. Find User
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("User not found in DB.");
      return { message: "Account not found.", success: false };
    }

    if (!user.isActive) {
      return { message: "Account is disabled. Contact Admin.", success: false };
    }

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch.");
      return { message: "Incorrect password.", success: false };
    }

    // 3. Create Session
    console.log("Creating session...");
    await createSession(user.id, user.role);

    // Store role to use outside try/catch
    userRole = user.role;
  } catch (error: any) {
    // LOG THE ACTUAL ERROR TO TERMINAL
    console.error("LOGIN SYSTEM ERROR:", error);
    return { message: "System error. Check server console.", success: false };
  }

  // 4. Redirect (Must happen outside try/catch to work in Next.js)
  if (userRole === "TEACHER") {
    redirect("/teacher-portal");
  } else {
    redirect("/dashboard");
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
