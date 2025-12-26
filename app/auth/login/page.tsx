import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const signInWithEmail = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        redirect("/auth/login?message=Invalid email or password");
      }
      redirect("/auth/login?message=" + encodeURIComponent(error.message));
    }

    redirect("/dashboard");
  };

  const signUpWithEmail = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      redirect("/auth/login?message=" + encodeURIComponent(error.message));
    }

    redirect("/auth/login?message=Check email to continue sign in process");
  };

  const signInWithGoogle = async () => {
    "use server";

    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      redirect("/auth/login?message=" + encodeURIComponent(error.message));
    }

    if (data.url) {
      redirect(data.url);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome to LinkGuardian
          </CardTitle>
          <CardDescription className="text-base">
            Monitor your affiliate links with ease
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            signInWithEmail={signInWithEmail}
            signUpWithEmail={signUpWithEmail}
            signInWithGoogle={signInWithGoogle}
            errorMessage={params.message}
          />
        </CardContent>
      </Card>
    </div>
  );
}
