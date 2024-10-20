import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma, Product } from '@prisma/client';
import { CreateProductDto } from './dto/create.dto';

@Injectable()
export class ProductService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      return this.databaseService.product.create({
        data: {
          ...createProductDto,
          featuredImage: {
            create: createProductDto.featuredImage,
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Prisma unique constraint violation error code
          throw new HttpException(
            `The URL ${CreateProductDto.arguments.featuredImage.url} is already taken.`,
            HttpStatus.CONFLICT,
          );
        }
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
