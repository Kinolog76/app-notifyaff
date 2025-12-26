import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const signOut = async () => {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Welcome back, {user.email}
            </p>
          </div>
          <form>
            <button
              formAction={signOut}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Links
            </h3>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              0
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Active Links
            </h3>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              0
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Broken Links
            </h3>
            <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
              0
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Your Links
          </h2>
          <p className="mt-4 text-center text-zinc-500 dark:text-zinc-400">
            No links added yet. Start by adding your first affiliate link!
          </p>
        </div>
      </div>
    </div>
  );
}
