'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  FolderKanban,
  Plus,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { createClient } from '@/utils/supabase/client';
import { WorkspaceModal } from '@/components/workspace/workspace-modal';

interface Workspace {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  is_default: boolean;
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Links',
    href: '/dashboard/links',
    icon: Link2,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
];

const bottomNavItems = [
  {
    title: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      const { data } = await supabase
        .from('workspaces')
        .select('id, name, icon, color, is_default')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (data) {
        setWorkspaces(data);
        const defaultWorkspace = data.find((w) => w.is_default);
        if (defaultWorkspace) {
          setSelectedWorkspace(defaultWorkspace.id);
        }
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <>
      <div className='flex h-16 min-h-16 items-center border-b px-6'>
        <Link href='/dashboard' className='flex items-center gap-2' onClick={onLinkClick}>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <span className='text-sm font-bold'>LG</span>
          </div>
          <span className='text-lg font-semibold'>LinkGuardian</span>
        </Link>
      </div>

      <nav className='flex flex-1 flex-col gap-2 p-4'>
        <div className='flex flex-col gap-1'>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onLinkClick}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                )}>
                <item.icon className='h-5 w-5' />
                {item.title}
              </Link>
            );
          })}
        </div>

        <Separator className='my-2' />

        {workspaces.length > 0 && (
          <>
            <div className='mb-2'>
              <div className='mb-2 flex items-center justify-between px-3'>
                <span className='text-xs font-semibold uppercase text-muted-foreground'>
                  Workspaces
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 w-6 p-0'
                  onClick={() => setIsWorkspaceModalOpen(true)}>
                  <Plus className='h-4 w-4' />
                  <span className='sr-only'>Add workspace</span>
                </Button>
              </div>
              <div className='flex flex-col gap-1'>
                {workspaces.slice(0, 5).map((workspace) => {
                  const isSelected = selectedWorkspace === workspace.id;
                  return (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        setSelectedWorkspace(workspace.id);
                        router.push(`/dashboard/workspaces/${workspace.id}`);
                        onLinkClick?.();
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left',
                        isSelected
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                      )}>
                      <div
                        className='h-3 w-3 flex-shrink-0 rounded-full'
                        style={{ backgroundColor: workspace.color }}
                      />
                      <span className='truncate'>
                        {workspace.icon} {workspace.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {workspaces.length > 5 && (
                <Link
                  href='/dashboard/workspaces'
                  onClick={onLinkClick}
                  className='mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-accent-foreground'>
                  <FolderKanban className='h-4 w-4' />
                  View all workspaces
                </Link>
              )}
            </div>
            <Separator className='my-2' />
          </>
        )}

        <div className='flex flex-col gap-1'>
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onLinkClick}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                )}>
                <item.icon className='h-5 w-5' />
                {item.title}
              </Link>
            );
          })}
        </div>

        <div className='mt-auto space-y-2'>
          <div className='flex items-center justify-between px-3'>
            <span className='text-sm font-medium text-muted-foreground'>Theme</span>
            <ThemeToggle />
          </div>
          <Button variant='ghost' className='w-full justify-start gap-3' onClick={handleSignOut}>
            <LogOut className='h-5 w-5' />
            Sign out
          </Button>
        </div>
      </nav>

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onSuccess={fetchWorkspaces}
      />
    </>
  );
};

export const DashboardSidebar = () => {
  return (
    <div className='fixed hidden h-screen w-64 flex-col border-r bg-card lg:flex'>
      <aside className='flex-1 flex flex-col'>
        <SidebarContent />
      </aside>
    </div>
  );
};

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className='flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden'>
      <Link href='/dashboard' className='flex items-center gap-2'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
          <span className='text-sm font-bold'>LG</span>
        </div>
        <span className='text-lg font-semibold'>LinkGuardian</span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='sm' className='h-10 w-10 p-0'>
            <Menu className='h-6 w-6' />
            <span className='sr-only'>Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-64 p-0'>
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
          </VisuallyHidden>
          <SidebarContent onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};
