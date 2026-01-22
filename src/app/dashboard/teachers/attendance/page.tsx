import prisma from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EditAttendanceLogDialog,
  ManualAttendanceDialog,
} from "@/components/dialogs/TeacherDialogs";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherAttendanceLog({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  // 1. Get Selected Date (or default to Today YYYY-MM-DD)
  const params = await searchParams;
  const dateParam = params.date || new Date().toISOString().split("T")[0];

  // 2. Create a Date Range (Start to End of that day in UTC)
  // This ensures we catch the record regardless of slight timezone differences
  const startOfDay = new Date(dateParam);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(dateParam);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // 3. Fetch Logs using the Range
  const logs = await prisma.teacherAttendance.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: { user: true },
    orderBy: { checkIn: "desc" },
  });

  // 4. Fetch Teachers for Dropdown
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Teacher Attendance</h2>
          <p className="text-slate-400">
            Date: {new Date(dateParam).toDateString()}
          </p>
        </div>

        <div className="flex gap-2">
          {/* DATE FILTER FORM */}
          <form className="flex gap-2 items-center">
            <input
              type="date"
              name="date"
              defaultValue={dateParam}
              className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-md text-sm"
            />
            <Button
              variant="outline"
              className="border-slate-700 bg-black text-white hover:bg-slate-900"
            >
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </form>

          {/* MANUAL ENTRY BUTTON */}
          <ManualAttendanceDialog teachers={teachers} />
        </div>
      </div>

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
                    <span className="text-slate-500 bg-slate-900 px-2 py-1 rounded text-xs border border-slate-700">
                      Finished
                    </span>
                  ) : (
                    <span className="text-green-400 bg-green-900/30 px-2 py-1 rounded text-xs animate-pulse border border-green-900">
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
                  No attendance records found for this date.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
