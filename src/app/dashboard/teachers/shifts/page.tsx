import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddTeacherShiftForm from "@/components/forms/AddTeacherShiftForm";
import { EditTeacherShiftDialog } from "@/components/dialogs/TeacherDialogs";
import DeleteButton from "@/components/ui/delete-button";
import { deleteTeacherShift } from "@/actions/teacher-actions";

export default async function TeacherShiftsPage() {
  const shifts = await prisma.teacherShift.findMany();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Teacher Work Shifts</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-black border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Create New Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <AddTeacherShiftForm />
          </CardContent>
        </Card>

        <Card className="bg-black border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Existing Shifts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {shifts.map((s) => (
              <div
                key={s.id}
                className="p-3 bg-slate-900 border border-slate-700 rounded flex justify-between items-center text-white"
              >
                <span className="font-bold">{s.name}</span>
                <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
                  {s.startTime} - {s.endTime}
                </span>
                <div className="flex items-center gap-2">
                  <EditTeacherShiftDialog shift={s} />
                  <DeleteButton id={s.id} deleteAction={deleteTeacherShift} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
