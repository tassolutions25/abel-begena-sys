"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";

interface DeleteButtonProps {
  id: string;
  deleteAction: (id: string) => Promise<{ success: boolean; message: string }>;
}

export default function DeleteButton({ id, deleteAction }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this? This action cannot be undone."
      )
    ) {
      startTransition(async () => {
        const result = await deleteAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      });
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="bg-red-900/50 hover:bg-red-900 text-red-200 hover:text-white border border-red-900"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
