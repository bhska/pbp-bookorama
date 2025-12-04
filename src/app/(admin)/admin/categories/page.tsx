'use client';

import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Categories } from '@prisma/client';

export default function CategoriesPage() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const categoriesSchema = z.object({
    name: z.string().min(1, 'Nama kategori wajib diisi'),
  });
  const form = useForm({
    defaultValues: {
      name: '',
    },
    mode: 'all',
    resolver: zodResolver(categoriesSchema),
  });

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const {
    data: categoriesData,
    refetch: refetchCategories,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get('/api/categories');
      return res.data;
    },
  });

  const isLoading = categoriesLoading;

  const handleOpen = (value: string | number | null) => {
    resetForm();
    if (open !== null) {
      setOpen(null);
    }
    if (value) {
      setOpen(value);
    }
  };

  const resetForm = () => {
    form.reset({
      name: '',
    });
  };

  const createSubmit = async (data: any) => {
    const body = {
      name: data.name,
    };

    try {
      await axios.post('/api/category', body);
      handleOpen(null);
      refetchCategories();
      setError(null);
      toast.success('Kategori berhasil ditambahkan!');
      resetForm();
    } catch (error: any) {
      toast.error('Kategori gagal ditambahkan!');
      if (error.response.status === 400) {
        form.setError(error?.response?.data.field, {
          type: 'manual',
          message: error?.response?.data.message,
        });
      } else {
        setError(error?.response?.data.message);
      }
    }
  };

  const editSubmit = async (data: any) => {
    const body = {
      name: data.name,
    };

    try {
      await axios.put(`/api/category/${open}`, body);
      handleOpen(null);
      refetchCategories();
      setError(null);
      toast.success('Kategori berhasil diubah!');
      resetForm();
    } catch (error: any) {
      toast.error('Kategori gagal diubah!');
      if (error.response.status === 400) {
        form.setError(error?.response?.data.field, {
          type: 'manual',
          message: error?.response?.data.message,
        });
      } else {
        setError(error?.response?.data.message);
      }
    }
  };

  const onSubmit = (data: any) => {
    if (open === 'addCategory') {
      createSubmit(data);
    } else {
      editSubmit(data);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/category/${id}`);
      refetchCategories();
      toast.success('Kategori berhasil dihapus!');
      setError(null);
    } catch (error) {
      toast.error('Kategori gagal dihapus!');
      setError(null);
      console.log(error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      handleOpen(id);
      const res = await axios.get(`/api/category/${id}`);

      form.setValue('name', res.data.data.name);
    } catch (error) {
      console.log(error);
    }
  };

  const openDeleteDrawer = (category: Categories) =>
    setDeleteTarget({
      id: category.id,
      name: category.name,
    });

  const formFields = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kategori</FormLabel>
              <FormControl>
                <Input placeholder='Masukkan nama kategori' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <FormDescription className='text-red-500'>{error}</FormDescription>
        )}

        <Button type='submit' className='w-full'>
          Simpan
        </Button>
      </form>
    </Form>
  );

  return (
    <div className='w-full flex flex-col p-0'>
      {isDesktop ? (
        <Dialog open={open !== null} onOpenChange={() => handleOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {open === 'addCategory' ? 'Tambah Kategori' : 'Edit Kategori'}
              </DialogTitle>
              <DialogDescription>
                Buat atau perbarui kategori buku.
              </DialogDescription>
            </DialogHeader>
            {formFields}
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
              <DrawerTitle>
                {open === 'addCategory' ? 'Tambah Kategori' : 'Edit Kategori'}
              </DrawerTitle>
              <DrawerDescription>
                Buat atau perbarui kategori buku.
              </DrawerDescription>
            </DrawerHeader>

            <div className='px-4'>{formFields}</div>
          </DrawerContent>
        </Drawer>
      )}

      {isDesktop ? (
        <Dialog
          open={deleteTarget !== null}
          onOpenChange={(value) => {
            if (!value) setDeleteTarget(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Kategori</DialogTitle>
              <DialogDescription>
                Hapus kategori beserta relasinya pada buku.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-3'>
              <p className='text-sm text-gray-600'>
                Yakin ingin menghapus kategori{' '}
                <span className='font-semibold text-gray-900'>
                  {deleteTarget?.name}
                </span>
                ?
              </p>
            </div>
            <div className='flex flex-col gap-2'>
              <Button
                variant='outline'
                onClick={() => setDeleteTarget(null)}
                className='w-full'
              >
                Batal
              </Button>
              <Button
                variant='destructive'
                className='w-full text-white'
                onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              >
                Hapus
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer
          open={deleteTarget !== null}
          onOpenChange={(value) => {
            if (!value) setDeleteTarget(null);
          }}
        >
          <DrawerContent className='pb-6'>
            <DrawerHeader className='px-4 text-left'>
              <DrawerTitle>Hapus Kategori</DrawerTitle>
              <DrawerDescription>
                Hapus kategori beserta relasinya pada buku.
              </DrawerDescription>
            </DrawerHeader>

            <div className='px-4 space-y-3'>
              <p className='text-sm text-gray-600'>
                Yakin ingin menghapus kategori{' '}
                <span className='font-semibold text-gray-900'>
                  {deleteTarget?.name}
                </span>
                ?
              </p>
            </div>

            <DrawerFooter className='pt-2'>
              <DrawerClose asChild>
                <Button variant='outline' className='w-full'>
                  Batal
                </Button>
              </DrawerClose>
              <Button
                variant='destructive'
                className='w-full'
                onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              >
                Hapus
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      <div className='flex justify-between items-center'>
        <h3 className='font-bold text-lg hidden md:block'>Daftar Kategori</h3>
        <Button
          size='sm'
          onClick={() => handleOpen('addCategory')}
          className='hidden md:inline-flex'
        >
          Tambah Kategori
        </Button>
      </div>

      <div className='md:hidden'>
        <Button className='w-full' onClick={() => handleOpen('addCategory')}>
          Tambah Kategori
        </Button>
      </div>

      {!isLoading ? (
        categoriesData.data.length > 0 ? (
          <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-3'>
            {categoriesData.data.map((category: Categories) => (
              <Card key={category.id} className='p-4 shadow-sm flex justify-between items-center'>
                <span className='font-semibold text-sm'>{category.name}</span>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleEdit(category.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    className='text-white'
                    onClick={() => openDeleteDrawer(category)}
                  >
                    Hapus
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className='mt-4 p-8 text-center text-sm text-gray-500'>
            Belum ada kategori yang ditambahkan.
          </Card>
        )
      ) : (
        <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-3'>
          <Skeleton className='h-20 bg-gray-200 rounded-md' />
          <Skeleton className='h-20 bg-gray-200 rounded-md' />
          <Skeleton className='h-20 bg-gray-200 rounded-md' />
        </div>
      )}
    </div>
  );
}
