"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null);

  return (
    <form action={action} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-white">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="bg-slate-900 border-slate-700 text-white mt-1"
            placeholder="name@begena.com"
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-white">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="bg-slate-900 border-slate-700 text-white mt-1"
            placeholder="••••••••"
          />
        </div>
      </div>

      {state?.message && (
        <div className="text-sm text-red-500 text-center font-medium bg-red-900/20 p-2 rounded border border-red-900">
          {state.message}
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-black font-bold hover:bg-amber-600 h-11"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
