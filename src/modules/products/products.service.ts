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

  async incrementStock(id: number, quantity: number) {
    if(!id || !quantity){
      throw new HttpException('Id o cantidad no proporcionado', HttpStatus.BAD_REQUEST);
    }
    try {
      const product = await this.productRepository.findOneBy({id});
      if(!product){
        throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
      }
      product.stock += quantity;
      return await this.productRepository.save(product);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async decrementStock(id: number, quantity: number) {
    if(!id || !quantity){
      throw new HttpException('Id o cantidad no proporcionado', HttpStatus.BAD_REQUEST);
    }
    try {
      const product = await this.productRepository.findOneBy({id});
      if(!product){
        throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
      }
      if(product.stock < quantity){
        throw new HttpException('No hay suficiente stock', HttpStatus.BAD_REQUEST);
      }
      product.stock -= quantity;
      return await this.productRepository.save(product);
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
