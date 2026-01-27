import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddTeacherShiftForm from "@/components/forms/AddTeacherShiftForm";
import { EditTeacherShiftDialog } from "@/components/dialogs/TeacherDialogs";
import DeleteButton from "@/components/ui/delete-button";
import { deleteTeacherShift } from "@/actions/teacher-actions";

export default async function TeacherShiftsPage() {
  const shifts = await prisma.teacherShift.findMany({
    orderBy: { startTime: "asc" },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Teacher Work Shifts</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT: CREATE */}
        <Card className="bg-black border-slate-800 h-fit">
          <CardHeader>
            <CardTitle className="text-white">Create New Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <AddTeacherShiftForm />
          </CardContent>
        </Card>

        {/* RIGHT: LIST */}
        <Card className="bg-black border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Existing Shifts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {shifts.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-slate-900 border border-slate-700 rounded flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white text-lg block">
                      {s.name}
                    </span>
                    <span className="text-sm text-primary font-mono">
                      {s.startTime} - {s.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EditTeacherShiftDialog shift={s} />
                    <DeleteButton id={s.id} deleteAction={deleteTeacherShift} />
                  </div>
                </div>

                {/* DISPLAY DAYS */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {s.workDays && s.workDays.length > 0 ? (
                    s.workDays.map((day) => (
                      <span
                        key={day}
                        className="text-[10px] bg-black border border-slate-600 text-slate-300 px-2 py-0.5 rounded capitalize"
                      >
                        {day.substring(0, 3).toLowerCase()}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-red-400">
                      No days selected
                    </span>
                  )}
                </div>
              </div>
            ))}
            {shifts.length === 0 && (
              <p className="text-slate-500">No shifts defined yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
