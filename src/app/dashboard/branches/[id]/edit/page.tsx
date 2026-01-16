import prisma from "@/lib/prisma";
import EditBranchForm from "@/components/forms/EditBranchForm";
import { notFound } from "next/navigation";

// CHANGE: params is now a Promise<{ id: string }>
export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await the params to get the ID
  const { id } = await params;

  // Now use the ID safely
  const branch = await prisma.branch.findUnique({
    where: { id },
  });

  if (!branch) return notFound();

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <EditBranchForm branch={branch} />
    </div>
  );
}
