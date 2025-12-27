import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.email}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Links
            </h3>
            <p className="mt-2 text-3xl font-bold">
              0
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Active Links
            </h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              0
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Broken Links
            </h3>
            <p className="mt-2 text-3xl font-bold text-red-600">
              0
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">
            Your Links
          </h2>
          <p className="mt-4 text-center text-muted-foreground">
            No links added yet. Start by adding your first affiliate link!
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
