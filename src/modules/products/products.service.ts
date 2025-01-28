import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductsService {

  constructor(@InjectRepository(Product) private productRepository: Repository<Product>) { }

  async create(createProductDto: CreateProductDto) {
    console.log(createProductDto);
    
    try {
      const newProduct = this.productRepository.create(createProductDto);
      return await this.productRepository.save(newProduct);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll() {
    try {
      const products = await this.productRepository.find();
      if (!products) {
        throw new HttpException('No hay productos', HttpStatus.NOT_FOUND);
      }
      return products;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {

    if (!id) {
      throw new HttpException('Id no proporcionado', HttpStatus.BAD_REQUEST);
    } else {
      try {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
          throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
        }
        return product;
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    if (!id) {
      throw new HttpException('Id no proporcionado', HttpStatus.BAD_REQUEST);
    } else {
      try {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
          throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
        }
        return await this.productRepository.update(product, updateProductDto);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }

  async remove(id: number) {
    if (!id) {
      throw new HttpException('Id no proporcionado', HttpStatus.BAD_REQUEST);
    } else {
      try {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
          throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
        }
        return await this.productRepository.remove(product);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
}
