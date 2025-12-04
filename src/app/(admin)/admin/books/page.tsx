'use client';

import { BooksDataTable } from './components/data-table-books';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Books, Categories } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export default function BooksPage() {
  const { data: sessionData } = useSession();
  const [isDesktop, setIsDesktop] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const booksSchema = z.object({
    isbn: z.string().min(1, 'ISBN wajib diisi'),
    title: z.string().min(1, 'Judul wajib diisi'),
    author: z.string().min(1, 'Pengarang wajib diisi'),
    price: z.coerce.number({ invalid_type_error: 'Harga wajib diisi' }).positive('Harga harus lebih dari 0'),
    category: z.string().min(1, 'Kategori wajib dipilih'),
  });
  const form = useForm({
    defaultValues: {
      isbn: '',
      title: '',
      author: '',
      price: '',
      category: '',
    },
    mode: 'all',
    resolver: zodResolver(booksSchema),
  });

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const {
    data: booksData,
    refetch: refetchBooks,
    isLoading: booksLoading,
  } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await axios.get('/api/books');
      return res.data;
    },
  });
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get('/api/categories');
      return res.data;
    },
  });

  const isLoading = categoriesLoading || booksLoading;

  const handleOpen = (value: string | number | null) => {
    if (value === null) {
      resetForm();
      setOpen(null);
      return;
    }

    // only used for Add flow; edit flow sets values explicitly
    resetForm();
    setOpen(value);
  };

  const resetForm = () => {
    form.reset({
      isbn: '',
      title: '',
      author: '',
      price: '',
      category: '',
    });
  };

  const createSubmit = async (data: any) => {
    const body = {
      author: data.author,
      title: data.title,
      isbn: data.isbn,
      price: Number(data.price),
      adminId: Number(sessionData?.user?.id),
      categoryId: Number(data.category),
    };

    try {
      await axios.post('/api/book', body);
      handleOpen(null);
      refetchBooks();
      setError(null);
      toast.success('Buku berhasil ditambahkan!');
      resetForm();
    } catch (error: any) {
      toast.error('Buku gagal ditambahkan!');
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
      isbn: data.isbn,
      title: data.title,
      author: data.author,
      price: Number(data.price),
      categoryId: Number(data.category),
    };

    try {
      await axios.put(`/api/book/${open}`, body);
      handleOpen(null);
      refetchBooks();
      setError(null);
      toast.success('Buku berhasil diubah!');
      resetForm();
    } catch (error: any) {
      toast.error('Buku gagal diubah!');
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
    if (open === 'addBooks') {
      createSubmit(data);
    } else {
      editSubmit(data);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/book/${id}`);
      refetchBooks();
      toast.success('Buku berhasil dihapus!');
      setError(null);
    } catch (error) {
      toast.error('Buku gagal dihapus!');
      setError(null);
      console.log(error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await axios.get(`/api/book/${id}`);

      form.reset({
        isbn: res.data.data.isbn,
        title: res.data.data.title,
        author: res.data.data.author,
        price: res.data.data.price.toString(),
        category: res.data.data.categoryId.toString(),
      });
      setError(null);
      setOpen(id);
    } catch (error) {
      console.log(error);
    }
  };

  const openDeleteDrawer = (book: Books) =>
    setDeleteTarget({
      id: book.isbn,
      title: book.title,
    });

  const getCategoryName = (id: number) =>
    categoriesData?.data.find((c: Categories) => c.id === id)?.name ?? '-';

  const formFields = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='isbn'
          render={({ field }) => (
            <FormItem>
              <FormLabel>ISBN</FormLabel>
              <FormControl>
                <Input placeholder='Masukkan ISBN buku' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul</FormLabel>
              <FormControl>
                <Input placeholder='Masukkan judul buku' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='author'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pengarang</FormLabel>
              <FormControl>
                <Input placeholder='Masukkan pengarang buku' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='price'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga</FormLabel>
              <FormControl>
                <Input placeholder='Masukkan harga buku' type='number' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {categoriesData && (
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih kategori buku' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesData.data.map((category: Categories) => (
                      <SelectItem
                        key={category.id.toString().concat(category.name)}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {error && (
          <FormDescription className='text-red-500'>{error}</FormDescription>
        )}

        <Button type='submit' className='w-full'>
          Simpan
        </Button>
      </form>
    </Form>
  );

  const deleteContent = (
    <>
      <div className='px-4 space-y-3'>
        <p className='text-sm text-gray-600'>
          Apakah Anda yakin ingin menghapus buku{' '}
          <span className='font-semibold text-gray-900'>
            {deleteTarget?.title}
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
          className='w-full text-white'
          onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
        >
          Hapus
        </Button>
      </DrawerFooter>
    </>
  );

  return (
    <div className='w-full flex flex-col p-0'>
      {isDesktop ? (
        <Dialog open={open !== null} onOpenChange={() => handleOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {open === 'addBooks' ? 'Tambah Buku' : 'Edit Buku'}
              </DialogTitle>
              <DialogDescription>
                Isi detail buku lalu simpan perubahan.
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
                {open === 'addBooks' ? 'Tambah Buku' : 'Edit Buku'}
              </DrawerTitle>
              <DrawerDescription>
                Isi detail buku lalu simpan perubahan.
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
              <DialogTitle>Hapus Buku</DialogTitle>
              <DialogDescription>
                Buku yang dihapus tidak dapat dikembalikan.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-3'>
              <p className='text-sm text-gray-600'>
                Apakah Anda yakin ingin menghapus buku{' '}
                <span className='font-semibold text-gray-900'>
                  {deleteTarget?.title}
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
                className='w-full'
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
              <DrawerTitle>Hapus Buku</DrawerTitle>
              <DrawerDescription>
                Buku yang dihapus tidak dapat dikembalikan.
              </DrawerDescription>
            </DrawerHeader>
            {deleteContent}
          </DrawerContent>
        </Drawer>
      )}

      <div className='flex justify-between items-center'>
        <h3 className='font-bold text-lg hidden md:block'>Daftar Buku</h3>
        <Button
          size='sm'
          onClick={() => handleOpen('addBooks')}
          className='hidden md:inline-flex'
        >
          Tambah Buku
        </Button>
      </div>

      <div className='md:hidden'>
        <Button className='w-full' onClick={() => handleOpen('addBooks')}>
          Tambah Buku
        </Button>
      </div>

      {/* Mobile: card list */}
      {!isLoading ? (
        booksData.data.length > 0 ? (
          <div className='mt-4 flex flex-col gap-3 md:hidden'>
            {booksData.data.map((book: any) => (
              <Card key={book.isbn} className='p-4 shadow-sm'>
                <div className='flex flex-col gap-1'>
                  <span className='font-semibold text-sm'>{book.title}</span>
                  <span className='text-xs text-gray-500'>
                    {book.author} • {getCategoryName(book.categoryId)}
                  </span>
                </div>
                <div className='flex justify-between items-center mt-3'>
                  <div className='flex flex-col text-sm'>
                    <span className='font-bold'>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      }).format(book.price)}
                    </span>
                    <span className='text-xs text-gray-500'>
                      Ditambahkan {new Date(book.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className='flex gap-2'>
                    <Button size='sm' variant='outline' onClick={() => handleEdit(book.isbn)}>
                      Edit
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      className='text-white'
                      onClick={() => openDeleteDrawer(book)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className='mt-4 md:hidden p-6 text-center text-sm text-gray-500 shadow-sm'>
            Belum ada buku yang ditambahkan.
          </Card>
        )
      ) : (
        <div className='mt-4 flex flex-col gap-3 md:hidden'>
          <Skeleton className='h-28 bg-gray-200 rounded-md' />
          <Skeleton className='h-28 bg-gray-200 rounded-md' />
          <Skeleton className='h-28 bg-gray-200 rounded-md' />
        </div>
      )}

      {/* Desktop: table */}
      {!isLoading ? (
        booksData.data.length > 0 ? (
          <Card className='mt-4 p-4 pt-0 hidden md:block'>
            <BooksDataTable
              data={booksData.data}
              handleDelete={(book) => openDeleteDrawer(book)}
              handleEdit={(id) => handleEdit(id)}
              categories={categoriesData.data}
            />
          </Card>
        ) : (
          <Card className='mt-4 p-8 text-center text-sm text-gray-500 hidden md:block'>
            Belum ada buku yang ditambahkan.
          </Card>
        )
      ) : (
        <Skeleton className='mt-4 h-96 bg-gray-200 hidden md:block' />
      )}
    </div>
  );
}
