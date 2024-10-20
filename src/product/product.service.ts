import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create.dto';

@Injectable()
export class ProductService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createProductDto: CreateProductDto) {
    return this.databaseService.product.create({
      data: {
        ...createProductDto,
        featuredImage: {
          create: createProductDto.featuredImage,
        },
      },
    });
  }

  async findAll() {
    return this.databaseService.product.findMany({
      include: {
        featuredImage: true,
      },
    });
  }

  async findOne(id: string) {
    return this.databaseService.product.findUnique({
      where: { id },
      include: {
        featuredImage: true,
      },
    });
  }

  async update(id: string, updateProductDto: Prisma.ProductUpdateInput) {
    return this.databaseService.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    return this.databaseService.product.delete({
      where: { id },
    });
  }
}
