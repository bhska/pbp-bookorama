import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const orderId = params.id;

  const order = await prisma.orders.findUnique({
    where: {
      id: Number(orderId),
    },
  });

  const orderItems = await prisma.orderItems.findMany({
    where: {
      orderId: Number(orderId),
    },
    include: {
      books: true,
    },
  });

  const books = orderItems.map((orderItem) => {
    return {
      ...orderItem.books,
      quantity: orderItem.quantity,
    };
  });

  return NextResponse.json({
    data: { ...order, books },
    status: 'success',
    message: 'Order fetched successfully',
  });
}
