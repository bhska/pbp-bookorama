'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next-nprogress-bar';
import { useCart } from '@/store/cart';
import {
  IconBook,
  IconCategory,
  IconLayoutDashboard,
  IconLogout,
} from '@tabler/icons-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { clearCart } = useCart();
  const { data } = useSession();
  const nav = [
    {
      label: 'Ikhtisar',
      href: '/admin',
    },
    {
      label: 'Buku',
      href: '/admin/books',
    },
    {
      label: 'Kategori',
      href: '/admin/categories',
    },
  ];
  const pathname = usePathname();
  const router = useRouter();
  const selectedNav = (item: string) => pathname === item;

  return (
    <div className='container max-w-2xl mx-auto min-h-screen flex justify-center pt-[74px] pb-28 md:pb-12 px-4'>
      <div className='fixed top-0 left-0 right-0 border-b border-gray-100 bg-white/70 backdrop-blur-lg z-50'>
        <div className='flex container mx-auto max-w-2xl py-3 md:py-4 justify-between items-center px-4'>
          <div className='flex gap-4 items-center'>
            <span className='font-bold'>Bookorama</span>

            <div className='hidden gap-2 md:flex'>
              {nav.map((item) => (
                <Button
                  size='sm'
                  className={cn(selectedNav(item.href) && 'bg-neutral-200')}
                  variant='ghost'
                  key={item.href}
                  onClick={() => router.push(item.href)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className='flex gap-4 items-center'>
            <Avatar>
              <AvatarFallback>{data?.user?.name?.slice(0, 1)}</AvatarFallback>
            </Avatar>

            <Button
              size='sm'
              className='hidden md:flex'
              onClick={() => {
                clearCart();
                signOut();
              }}
            >
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className='fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 md:hidden flex justify-around items-center z-50 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]'>
        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'flex flex-col items-center gap-1 h-auto min-w-[70px] text-xs font-medium text-gray-600',
            selectedNav('/admin') && 'text-primary'
          )}
          onClick={() => router.push('/admin')}
        >
          <IconLayoutDashboard size={24} />
          <span className='text-[11px]'>Ikhtisar</span>
        </Button>

        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'flex flex-col items-center gap-1 h-auto min-w-[70px] text-xs font-medium text-gray-600',
            selectedNav('/admin/books') && 'text-primary'
          )}
          onClick={() => router.push('/admin/books')}
        >
          <IconBook size={24} />
          <span className='text-[11px]'>Buku</span>
        </Button>

        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'flex flex-col items-center gap-1 h-auto min-w-[70px] text-xs font-medium text-gray-600',
            selectedNav('/admin/categories') && 'text-primary'
          )}
          onClick={() => router.push('/admin/categories')}
        >
          <IconCategory size={24} />
          <span className='text-[11px]'>Kategori</span>
        </Button>

        <Button
          variant='ghost'
          size='sm'
          className='flex flex-col items-center gap-1 h-auto min-w-[70px] text-xs font-medium text-gray-600'
          onClick={() => {
            clearCart();
            signOut();
          }}
        >
          <IconLogout size={24} />
          <span className='text-[11px]'>Keluar</span>
        </Button>
      </div>

      <div className='py-4 w-full'>{children}</div>
    </div>
  );
}
