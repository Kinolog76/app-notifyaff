import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UpdatePasswordForm } from './update-password-form';

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  const updatePassword = async (formData: FormData) => {
    'use server';

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      redirect('/auth/update-password?message=Passwords do not match');
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      redirect('/auth/update-password?message=' + encodeURIComponent(error.message));
    }

    redirect('/login?message=Password updated successfully');
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='text-2xl font-bold tracking-tight'>Update Password</CardTitle>
          <CardDescription className='text-base'>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdatePasswordForm updatePassword={updatePassword} errorMessage={params.message} />
        </CardContent>
      </Card>
    </div>
  );
}
