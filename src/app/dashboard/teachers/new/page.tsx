import prisma from "@/lib/prisma";
import TeacherRegisterForm from "@/components/forms/TeacherRegisterForm";
import { ArrowLeft, UserPlus } from "lucide-react"; // Import Icons
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewTeacherPage() {
  const branches = await prisma.branch.findMany();
  const shifts = await prisma.teacherShift.findMany();

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <div className="w-full max-w-2xl">
        {/* 1. BACK BUTTON (Now Correctly Positioned) */}
        <div className="mb-4">
          <Link href="/dashboard/teachers">
            <Button
              variant="ghost"
              className="text-slate-400 pl-0 hover:text-white hover:bg-transparent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teachers List
            </Button>
          </Link>
        </div>

        {/* 2. HEADER WITH ICON */}
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Teacher Registration
            </h1>
            <p className="text-slate-400">
              Add a new staff member to the system.
            </p>
          </div>
        </div>

        {/* 3. FORM COMPONENT */}
        <TeacherRegisterForm branches={branches} shifts={shifts} />
      </div>
    </div>
  );
}
