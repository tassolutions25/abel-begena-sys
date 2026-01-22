import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-black">
            <span className="text-xl font-bold text-primary">AB</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
            Abel Begena School
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your dashboard
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
