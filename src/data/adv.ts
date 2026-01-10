import { prisma } from '@/lib/prisma';
import type { Adv } from '@/entities';

export async function getAllAdvs(includeDeleted = false) {
  return await prisma.adv.findMany({
    where: includeDeleted ? {} : { status: { not: 'DELETED' } },
    orderBy: { date: 'desc' },
    include: {
      user: true,
    },
  });
}

export async function getAdvById(id: string) {
  return await prisma.adv.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
}

export async function createAdv(data: Omit<Adv, 'id' | 'createdAt' | 'updatedAt'>) {
  const adv = await prisma.adv.create({
    data,
    include: {
      user: true,
    },
  });

  // Log scheduled publication
  if (data.status === 'PLANNED') {
    console.log(`📅 Adv scheduled for publication: "${data.title}" at ${data.date.toLocaleString('it-IT')}`);
  }

  return adv;
}

export async function updateAdv(id: string, data: Partial<Omit<Adv, 'id' | 'createdAt' | 'updatedAt'>>) {
  const adv = await prisma.adv.update({
    where: { id },
    data,
    include: {
      user: true,
    },
  });

  // Log scheduled publication
  if (data.status === 'PLANNED' && data.date) {
    console.log(`📅 Adv rescheduled for publication: "${adv.title}" at ${data.date.toLocaleString('it-IT')}`);
  }

  return adv;
}

export async function deleteAdv(id: string, softDelete = true) {
  if (softDelete) {
    return await prisma.adv.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  } else {
    return await prisma.adv.delete({
      where: { id },
    });
  }
}
