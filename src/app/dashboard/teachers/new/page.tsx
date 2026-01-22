import prisma from "@/lib/prisma";
import TeacherRegisterForm from "@/components/forms/TeacherRegisterForm"; // We'll create this

export default async function NewTeacherPage() {
  const branches = await prisma.branch.findMany();
  const shifts = await prisma.teacherShift.findMany();

  return (
    <div className="max-w-xl mx-auto pt-10">
      <h2 className="text-2xl font-bold text-white mb-6">
        Register New Teacher
      </h2>
      <TeacherRegisterForm branches={branches} shifts={shifts} />
    </div>
  );
}
