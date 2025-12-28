'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface ResetPasswordFormProps {
  sendResetEmail: (formData: FormData) => Promise<void>;
  message?: string;
}

export function ResetPasswordForm({ sendResetEmail, message }: ResetPasswordFormProps) {
  const isSuccess = message?.includes('Check your email');

  return (
    <div className='space-y-4'>
      {message && (
        <div
          className={`px-4 py-3 rounded-md text-sm ${
            isSuccess
              ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-400'
          }`}>
          {message}
        </div>
      )}

      <form className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email address</Label>
          <Input id='email' name='email' type='email' placeholder='you@example.com' required />
        </div>

        <Button formAction={sendResetEmail} size='lg' className='w-full'>
          Send reset link
        </Button>
      </form>

      <div className='text-center'>
        <Link href='/login' className='text-sm text-primary hover:underline'>
          Back to login
        </Link>
      </div>
    </div>
  );
}
