import prisma from "@/lib/prisma";
import EditStudentForm from "@/components/forms/EditStudentForm";
import { notFound } from "next/navigation";

// CHANGE: params is now a Promise<{ id: string }>
export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await the params to get the ID
  const { id } = await params;

  // Now use the ID safely
  const [student, branches] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.branch.findMany({ select: { id: true, name: true } }),
  ]);

  if (!student) return notFound();

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <EditStudentForm student={student} branches={branches} />
    </div>
  );
}
