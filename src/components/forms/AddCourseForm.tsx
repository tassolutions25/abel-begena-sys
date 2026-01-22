"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCourse } from "@/actions/academic-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AddCourseForm() {
  const [state, action, isPending] = useActionState(createCourse, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex gap-2">
      <Input
        name="name"
        placeholder="e.g. Begena"
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        required
      />
      <Button
        type="submit"
        className="bg-primary text-black font-bold hover:bg-amber-600"
        disabled={isPending}
      >
        {isPending ? "Adding..." : "Add"}
      </Button>
    </form>
  );
}
