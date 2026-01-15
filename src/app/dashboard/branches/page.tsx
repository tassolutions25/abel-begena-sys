import Link from "next/link";
import prisma from "@/lib/prisma";
import { deleteBranch } from "@/actions/delete-actions";
import DeleteButton from "@/components/ui/delete-button";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Branches
          </h2>
          <p className="text-slate-400">Manage school locations.</p>
        </div>
        {/* BUTTON REDIRECTS TO BRANCH FORM */}
        <Link href="/dashboard/branches/new">
          <Button className="bg-primary text-black hover:bg-amber-600 font-bold">
            <Plus className="mr-2 h-4 w-4" /> Add Branch
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <Card
            key={branch.id}
            className="bg-black border border-slate-800 text-slate-200"
          >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="text-xl text-primary">
                  {branch.name}
                </CardTitle>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {branch.location}
                </div>
              </div>
              <DeleteButton id={branch.id} deleteAction={deleteBranch} />
            </CardHeader>
            <CardContent>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Currency: {branch.currency}
                </span>
                <span className="bg-slate-900 px-2 py-1 rounded text-white">
                  {branch._count.users} Students
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
