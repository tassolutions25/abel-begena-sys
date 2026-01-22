import prisma from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import EditAttendanceLogDialog from "@/components/dialogs/EditAttendanceLogDialog"; // New Dialog
import { EditAttendanceLogDialog } from "@/components/dialogs/TeacherDialogs";

export const dynamic = "force-dynamic";

export default async function TeacherAttendanceLog() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch today's logs
  const logs = await prisma.teacherAttendance.findMany({
    where: { date: today },
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">
        Teacher Attendance (Today)
      </h2>

      <div className="rounded-md border border-slate-800 bg-black">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-300">Teacher</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Clock In</TableHead>
              <TableHead className="text-slate-300">Clock Out</TableHead>
              <TableHead className="text-right text-slate-300">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="border-slate-800">
                <TableCell className="text-white font-medium">
                  {log.user.fullName}
                </TableCell>
                <TableCell>
                  {log.checkOut ? (
                    <span className="text-slate-500 bg-slate-900 px-2 py-1 rounded text-xs">
                      Finished
                    </span>
                  ) : (
                    <span className="text-green-400 bg-green-900/30 px-2 py-1 rounded text-xs animate-pulse">
                      Working
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-slate-300">
                  {log.checkIn
                    ? log.checkIn.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </TableCell>
                <TableCell className="text-slate-300">
                  {log.checkOut
                    ? log.checkOut.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <EditAttendanceLogDialog log={log} />
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-slate-500 h-24"
                >
                  No attendance records for today.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
