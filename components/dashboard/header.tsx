'use client';

import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardSidebar } from './sidebar';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export const DashboardHeader = () => {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className='sticky top-0 z-40 border-b bg-card'>
      <div className='flex h-16 items-center justify-end gap-4 px-6'>
        <Sheet>
          <SheetTrigger asChild></SheetTrigger>
          <SheetContent side='left' className='p-0'>
            <DashboardSidebar />
          </SheetContent>
        </Sheet>

        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' className='relative'>
            <Bell className='h-5 w-5' />
            <span className='absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500' />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-10 w-10 rounded-full p-0'>
                <Avatar>
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className='mr-2 h-4 w-4' />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
