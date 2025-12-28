import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from './login-form';

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
    redirect('/dashboard');
  }

  const signInWithEmail = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        redirect('/login?message=Invalid email or password');
      }
      redirect('/login?message=' + encodeURIComponent(error.message));
    }

    redirect('/dashboard');
  };

  const signUpWithEmail = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      redirect('/login?message=' + encodeURIComponent(error.message));
    }

    redirect('/login?message=Check email to continue sign in process');
  };

  const signInWithGoogle = async () => {
    'use server';

    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      redirect('/login?message=' + encodeURIComponent(error.message));
    }

    if (data.url) {
      redirect(data.url);
    }
  };

  return (
    <div className='relative flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black p-4'>
      <Link href='/' className='absolute top-6 left-6'>
        <Button variant='ghost' size='sm' className='gap-2'>
          <ArrowLeft className='h-4 w-4' />
          Back to Home
        </Button>
      </Link>

      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='space-y-3 text-center pb-6'>
          <div className='mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='w-6 h-6 text-primary'>
              <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
              <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
            </svg>
          </div>
          <CardDescription className='text-base'>
            Sign in to monitor your affiliate links
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
