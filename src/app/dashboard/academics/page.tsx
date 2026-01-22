import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddCourseForm from "@/components/forms/AddCourseForm";
import AddShiftForm from "@/components/forms/AddShiftForm";
import {
  EditCourseDialog,
  EditShiftDialog,
} from "@/components/dialogs/AcademicDialogs";
import DeleteButton from "@/components/ui/delete-button";
import { deleteCourse, deleteShift } from "@/actions/academic-actions";

export const dynamic = "force-dynamic";

export default async function AcademicsPage() {
  // Fetch data WITH enrollment counts
  const shifts = await prisma.shift.findMany({
    orderBy: { startTime: "asc" },
    include: { _count: { select: { enrollments: true } } },
  });

  const courses = await prisma.course.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Academic Settings
        </h2>
        <p className="text-slate-400">Manage Classes and Time Shifts.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* COURSES SECTION */}
        <Card className="bg-black border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Classes (Categories)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AddCourseForm />
            <div className="space-y-2">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-900 text-white rounded border border-slate-800 flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      {c._count.enrollments} Students
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <EditCourseDialog course={c} />
                    <DeleteButton id={c.id} deleteAction={deleteCourse} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SHIFTS SECTION */}
        <Card className="bg-black border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Time Shifts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AddShiftForm />
            <div className="space-y-2">
              {shifts.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-slate-900 text-white rounded border border-slate-800 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-primary">{s.name}</div>
                    <div className="text-xs text-slate-400">
                      {s.startTime} - {s.endTime}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      {s._count.enrollments} Enrolled
                    </span>
                    <div className="flex gap-1">
                      <EditShiftDialog shift={s} />
                      <DeleteButton id={s.id} deleteAction={deleteShift} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
