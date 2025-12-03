import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const categoryId = params.id;

  const category = await prisma.categories.findUnique({
    where: {
      id: Number(categoryId),
    },
  });

  return NextResponse.json({
    data: category,
    status: 'success',
    message: 'Category fetched successfully',
  });
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const categoryId = params.id;

  await prisma.categories.delete({
    where: {
      id: Number(categoryId),
    },
  });

  return NextResponse.json({
    status: 'success',
    message: 'Category deleted successfully',
  });
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }>; body: any }) {
  const params = await props.params;

  const {
    body
  } = props;

  const categoryId = params.id;
  const req = await request.json();

  try {
    const updatedCategory = await prisma.categories.update({
      where: {
        id: Number(categoryId),
      },
      data: {
        name: req.name,
      },
    });

    return NextResponse.json({
      data: updatedCategory,
      status: 'success',
      message: 'Category updated successfully',
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError)
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
