import { Prisma } from '@prisma/client';

export interface CreateProductDto extends Prisma.ProductCreateInput {
  featured: {
    url: string;
    alt: string;
  };
}
