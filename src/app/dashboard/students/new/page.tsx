import prisma from "@/lib/prisma";
import NewStudentForm from "@/components/forms/NewStudentForm"; // We assume this exists from previous steps
import { UserPlus } from "lucide-react";

export default async function NewStudentPage() {
  // Fetch branches to show in dropdown
  const branches = await prisma.branch.findMany({
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Student Registration
            </h1>
            <p className="text-slate-400">
              Enroll a new student into the system.
            </p>
          </div>
        </div>
        <NewStudentForm branches={branches} />
      </div>
    </div>
  );
}
