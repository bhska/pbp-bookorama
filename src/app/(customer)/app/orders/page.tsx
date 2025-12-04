'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Books, Orders } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
require('dayjs/locale/id');
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IconStarFilled } from '@tabler/icons-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

var localizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(localizedFormat);
dayjs.locale('id');

export default function OrdersPage() {
  const [open, setOpen] = useState<string | number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await axios.get('/api/orders');
      return res.data;
    },
  });
  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ['order'],
    enabled: open !== null,
    queryFn: async () => {
      const res = await axios.get(`/api/order/${open}`);
      return res.data;
    },
  });

  const handleOpen = (value: string | number | null) => {
    if (open !== null) {
      setOpen(null);
    }
    if (value) {
      setOpen(value);
    }
  };

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <div className='w-full flex flex-col gap-6'>
      {isDesktop ? (
        <Dialog
          open={open !== null}
          onOpenChange={(value) => {
            if (!value) handleOpen(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detail Order</DialogTitle>
              <DialogDescription>
                Ringkasan transaksi dan daftar buku yang dibeli.
              </DialogDescription>
            </DialogHeader>
            <div className='flex flex-col gap-3 pb-2'>
              <div className='flex justify-between w-full mt-2'>
                <span className='font-semibold'>No. Transaksi</span>
                {orderLoading ? (
                  <Skeleton className='h-3 w-9' />
                ) : (
                  <span className='text-right'>#{orderData?.data.id}</span>
                )}
              </div>
              <div className='flex justify-between w-full'>
                <span className='font-semibold'>Tanggal Transaksi</span>
                {orderLoading ? (
                  <Skeleton className='h-3 w-9' />
                ) : (
                  <span className='text-right'>
                    {dayjs(orderData?.data.date).format('L LT')}
                  </span>
                )}
              </div>
              <div className='flex justify-between w-full'>
                <span className='font-semibold'>Total</span>
                {orderLoading ? (
                  <Skeleton className='h-3 w-9' />
                ) : (
                  <span className='text-right'>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(orderData?.data.amount)}
                  </span>
                )}
              </div>

              <div className='flex gap-4 flex-col'>
                <span className='font-semibold'>Daftar Pembelian</span>

                <ScrollArea className='flex flex-col h-44'>
                  {orderData?.data.books.map((book: Books) => (
                    <div key={book.isbn} className='w-full flex-1 flex-col flex'>
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
                      </div>
                      {orderData?.data.books.indexOf(book) !==
                        orderData?.data.books.length - 1 && (
                        <Separator className='my-2' />
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <Button
                size='sm'
                className='flex gap-1 mt-2'
                variant='outline'
                onClick={(e) => {
                  e.stopPropagation();
                  toast.success('Fitur dalam pengembangan');
                }}
              >
                <IconStarFilled size={14} stroke={3} /> Beri Ulasan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer
          open={open !== null}
          onOpenChange={(value) => {
            if (!value) handleOpen(null);
          }}
        >
          <DrawerContent className='pb-6'>
            <DrawerHeader className='px-4 text-left'>
              <DrawerTitle>Detail Order</DrawerTitle>
              <DrawerDescription>
                Ringkasan transaksi dan daftar buku yang dibeli.
              </DrawerDescription>
            </DrawerHeader>
            <div className='flex flex-col gap-3 px-4 pb-2'>
              <div className='flex justify-between w-full mt-2'>
                <span className='font-semibold'>No. Transaksi</span>
                {orderLoading ? (
                  <Skeleton className='h-3 w-9' />
                ) : (
                  <span className='text-right'>#{orderData?.data.id}</span>
                )}
              </div>
              <div className='flex justify-between w-full'>
                <span className='font-semibold'>Tanggal Transaksi</span>
                {orderLoading ? (
                  <Skeleton className='h-3 w-9' />
                ) : (
                  <span className='text-right'>
                    {dayjs(orderData?.data.date).format('L LT')}
                  </span>
                )}
              </div>
              <div className='flex justify-between w-full'>
                <span className='font-semibold'>Total</span>
                {orderLoading ? (
                  <Skeleton className='h-3 w-9' />
                ) : (
                  <span className='text-right'>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(orderData?.data.amount)}
                  </span>
                )}
              </div>

              <div className='flex gap-4 flex-col'>
                <span className='font-semibold'>Daftar Pembelian</span>

                <ScrollArea className='flex flex-col h-44'>
                  {orderData?.data.books.map((book: Books) => (
                    <div key={book.isbn} className='w-full flex-1 flex-col flex'>
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
                      </div>
                      {orderData?.data.books.indexOf(book) !==
                        orderData?.data.books.length - 1 && (
                        <Separator className='my-2' />
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <Button
                size='sm'
                className='flex gap-1 mt-2'
                variant='outline'
                onClick={(e) => {
                  e.stopPropagation();
                  toast.success('Fitur dalam pengembangan');
                }}
              >
                <IconStarFilled size={14} stroke={3} /> Beri Ulasan
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      <div className='flex flex-col gap-4 w-full'>
        <h3 className='font-bold text-lg'>Semua Pesanan</h3>

        <div className='flex flex-col gap-4'>
          {!ordersLoading
            ? (ordersData as any)?.data.map((order: Orders) => (
                <Card
                  key={order.id}
                  className='w-full flex flex-col p-4 shadow-sm'
                  onClick={() => handleOpen(order.id)}
                >
                  <div className='flex justify-between items-center gap-4'>
                    <div className='flex flex-col gap-1'>
                      <span className='text-gray-400 text-sm'>
                        Transaksi #{order.id}
                      </span>
                      <span className='font-semibold text-sm'>
                        {dayjs(order.date).format('L LT')}
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='font-bold text-sm md:text-base'>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(order.amount)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            : [1, 2, 3, 4].map((order) => (
                <Skeleton key={order} className='w-full h-32 bg-gray-200 rounded-md' />
              ))}
        </div>
      </div>
    </div>
  );
}
