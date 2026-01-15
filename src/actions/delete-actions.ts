"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteBranch(id: string) {
  try {
    // Check if branch has students first
    const studentCount = await prisma.user.count({ where: { branchId: id } });
    if (studentCount > 0) {
      return {
        success: false,
        message: "Cannot delete: This branch has students!",
      };
    }

    await prisma.branch.delete({ where: { id } });
    revalidatePath("/dashboard/branches");
    return { success: true, message: "Branch deleted." };
  } catch (error) {
    return { success: false, message: "Error deleting branch." };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/dashboard/students");
    return { success: true, message: "Student deleted." };
  } catch (error) {
    return { success: false, message: "Error deleting student." };
  }
}
