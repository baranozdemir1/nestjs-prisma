import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum ProductType {
  SIMPLE = 'SIMPLE',
  VARIABLE = 'VARIABLE',
}

class FeaturedImageDto {
  @IsString({ message: 'url must be a string' })
  @IsNotEmpty({ message: 'url is required' })
  @IsUrl(
    {
      require_protocol: true,
      require_host: true,
      require_valid_protocol: true,
      protocols: ['https'],
    },
    { message: 'url must be valid' },
  )
  url: string;

  @IsString({ message: 'alt must be a string' })
  @IsNotEmpty({ message: 'alt is required' })
  @MinLength(3, { message: 'alt must be at least 3 characters' })
  alt: string;
}

export class CreateProductDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  name: string;

  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  @MinLength(3, { message: 'Slug must be at least 3 characters' })
  slug: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MinLength(3, { message: 'Description must be at least 3 characters' })
  @MaxLength(255, { message: 'Description must be at most 255 characters' })
  description: string;

  @IsNumber({}, { message: 'Regular price must be a number' })
  @IsNotEmpty({ message: 'Regular price is required' })
  regularPrice: number;

  @IsNumber({}, { message: 'Sale price must be a number' })
  @IsOptional()
  salePrice: number;

  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: true,
    },
    { message: 'Stock quantity must be a number' },
  )
  @IsOptional()
  stockQuantity: number;

  @IsString({ message: 'SKU must be a string' })
  @IsOptional()
  sku: string;

  @IsEnum(ProductStatus, { message: 'Status must be a valid ProductStatus' })
  @IsOptional()
  status: ProductStatus;

  @IsEnum(ProductType, { message: 'Type must be a valid ProductType' })
  @IsOptional()
  type: ProductType;

  @IsObject({ message: 'Featured image must be an object' })
  @IsNotEmpty({ message: 'Featured image is required' })
  @ValidateNested()
  @Type(() => FeaturedImageDto)
  featuredImage: FeaturedImageDto;
}
