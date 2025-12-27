"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddLinkForm } from "@/components/links/add-link-form";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);
      }
    };

    getUser();
  }, [router, supabase]);

  if (!user) {
    return null;
  }

  const handleLinkAdded = () => {
    setIsDialogOpen(false);
    // TODO: Refresh links list
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back, {user.email}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Affiliate Link</DialogTitle>
                <DialogDescription>
                  Add a new affiliate link to start monitoring its health and performance.
                </DialogDescription>
              </DialogHeader>
              <AddLinkForm
                onSuccess={handleLinkAdded}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
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
