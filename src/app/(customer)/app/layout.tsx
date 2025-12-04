'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next-nprogress-bar';
import { IconShoppingCart, IconTrash, IconHome, IconList } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Books } from '@prisma/client';
import { useCart } from '@/store/cart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = useSession();
  const nav = [
    {
      label: 'Beranda',
      href: '/app',
    },
    {
      label: 'Pesanan',
      href: '/app/orders',
    },
  ];
  const pathname = usePathname();
  const router = useRouter();
  const selectedNav = (item: string) => pathname === item;
  const { cart, removeFromCart, clearCart } = useCart();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = () => setOpen(!open);

  const handleOrder = async () => {
    setIsLoading(true);
    const body = {
      cart: cart,
      userId: Number(data?.user?.id),
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await axios.post('/api/order', body);
      toast.success('Berhasil membuat pesanan');
      router.push('/app/orders');
      handleOpen();
      clearCart();
      setIsLoading(false);
    } catch (error) {
      toast.error('Gagal membuat pesanan');
    }
  };

  return (
    <div className='container max-w-2xl mx-auto min-h-screen flex justify-center pt-[74px] max-[445px]:pb-24'>
      <div className='fixed top-0 w-full mx-auto border border-gray-100 bg-white/50 backdrop-blur-sm z-50'>
        <div className='flex container mx-auto max-w-2xl py-4 justify-between items-center px-4 md:px-0'>
          <div className='flex gap-4 items-center'>
            <span className='font-bold'>Bookorama</span>

            <div className='flex gap-2 max-[445px]:hidden'>
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
              variant='outline'
              className='flex gap-2 relative max-[445px]:hidden'
              onClick={handleOpen}
            >
              <IconShoppingCart size={16} />
              Keranjang
              <Badge
                className='absolute -top-3 -right-3 px-2'
                variant='default'
                suppressHydrationWarning
              >
                {cart.length}
              </Badge>
            </Button>

            <Button size='sm' onClick={() => signOut()} className="flex max-[445px]:hidden">
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 hidden max-[445px]:flex justify-around items-center z-50 pb-safe">
        <Button
          variant="ghost"
          size="icon"
          className={cn("flex flex-col items-center gap-1 h-auto", selectedNav('/app') && "text-primary")}
          onClick={() => router.push('/app')}
        >
          <IconHome size={24} />
          <span className="text-[10px]">Beranda</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn("flex flex-col items-center gap-1 h-auto", selectedNav('/app/orders') && "text-primary")}
          onClick={() => router.push('/app/orders')}
        >
          <IconList size={24} />
          <span className="text-[10px]">Pesanan</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center gap-1 h-auto relative"
          onClick={handleOpen}
        >
          <div className="relative">
            <IconShoppingCart size={24} />
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1 h-4 min-w-[1rem] flex items-center justify-center text-[10px]" variant="destructive">
                {cart.length}
              </Badge>
            )}
          </div>
          <span className="text-[10px]">Keranjang</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center gap-1 h-auto"
          onClick={() => signOut()}
        >
          <IconTrash size={24} className="rotate-180" /> {/* Using IconTrash as logout placeholder if needed, or just text */}
          <span className="text-[10px]">Keluar</span>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keranjang</DialogTitle>
          </DialogHeader>

          <div className='flex flex-col gap-4'>
            {cart.length > 0 ? (
              <>
                <ScrollArea className='flex flex-col h-72'>
                  {cart.map((book: Books) => (
                    <div
                      key={book.isbn}
                      className='w-full flex-1 flex-col flex'
                    >
                      <div className='flex w-full items-center gap-4'>
                        <div className='flex flex-1 flex-col'>
                          <span className='font-semibold text-sm'>
                            {book.title}
                          </span>
                          <span className='text-xs text-gray-400'>
                            {book.author}
                          </span>
                        </div>
                        <div className='flex flex-col'>
                          <span className='font-bold text-sm'>
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                            }).format(book.price)}
                          </span>
                        </div>
                        <Button
                          size='sm'
                          className='flex gap-1'
                          variant='outline'
                          onClick={() => removeFromCart(book)}
                        >
                          <IconTrash size={14} stroke={3} />
                        </Button>
                      </div>
                      {cart.indexOf(book) !== cart.length - 1 && (
                        <Separator className='my-2' />
                      )}
                    </div>
                  ))}
                </ScrollArea>
                <div className='flex justify-between'>
                  <span className='font-semibold'>Total</span>
                  <span className='font-semibold'>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(
                      cart.reduce((total, book) => total + book.price, 0)
                    )}
                  </span>
                </div>
                <Button
                  size='sm'
                  className='mt-2'
                  onClick={() => handleOrder()}
                  loading={isLoading}
                >
                  Beli
                </Button>
              </>
            ) : (
              <div className='flex items-center justify-center h-24'>
                <span className='font-semibold text-sm text-center'>
                  Keranjang kosong
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className='py-4 w-full'>{children}</div>
    </div>
  );
}
