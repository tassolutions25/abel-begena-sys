import prisma from "@/lib/prisma";
import AddAdminDialog from "@/components/dialogs/AddAdminDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Mail } from "lucide-react";

export default async function AdminsPage() {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Administrators</h2>
        <AddAdminDialog />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {admins.map((admin) => (
          <Card key={admin.id} className="bg-black border border-slate-800">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">
                  {admin.fullName}
                </CardTitle>
                <p className="text-xs text-slate-500 font-mono">{admin.role}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4" /> {admin.email}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
