import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const booksId = params.id;

  const book = await prisma.books.findUnique({
    where: {
      isbn: booksId,
    },
  });

  return NextResponse.json({
    data: book,
    status: 'success',
    message: 'Book fetched successfully',
  });
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const booksId = params.id;

  const book = await prisma.books.findUnique({
    where: {
      isbn: booksId,
    },
    include: {
      orderItems: {
        include: {
          books: true,
        },
      },
    },
  });

  if (book?.orderItems) {
    for (const orderDetail of book.orderItems) {
      await prisma.orderItems.deleteMany({
        where: {
          orderId: orderDetail.id,
        },
      });
    }
  }

  await prisma.orderItems.deleteMany({
    where: {
      isbn: booksId,
    },
  });

  await prisma.books.delete({
    where: {
      isbn: booksId,
    },
  });

  return NextResponse.json({
    status: 'success',
    message: 'Book deleted successfully',
  });
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }>; body: any }) {
  const params = await props.params;

  const {
    body
  } = props;

  const booksId = params.id;
  const req = await request.json();

  try {
    const updatedBook = await prisma.books.update({
      where: {
        isbn: booksId,
      },
      data: {
        title: req.title,
        author: req.author,
        price: req.price,
        categoryId: req.categoryId,
        isbn: req.isbn,
      },
    });

    return NextResponse.json({
      data: updatedBook,
      status: 'success',
      message: 'Book updated successfully',
    });
  } catch (e) {
    if (e.code === 'P2002') {
      return NextResponse.json(
        {
          status: 'error',
          message: `Sudah ada buku dengan ISBN ${booksId}. Silahkan coba lagi dengan ISBN yang berbeda`,
          field: 'isbn',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: 'error',
        message: `Server sedang mengalami gangguan`,
        fullMessage: e,
      },
      { status: 500 }
    );
  }
}
