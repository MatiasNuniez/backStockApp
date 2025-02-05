import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>
  ) { }

  async create(createProductDto: CreateProductDto) {
    console.log(createProductDto);
    
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: createProductDto.category },
      });
  
      if (!category) {
        throw new HttpException('Categoría no encontrada', HttpStatus.NOT_FOUND);
      }
  
      const newProduct = this.productRepository.create({
        ...createProductDto,
        category,
      });
  
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
      const products = await this.productRepository.find({
        relations: ["category"],
      });
  
      if (!products.length) {
        throw new HttpException('No hay productos', HttpStatus.NOT_FOUND);
      }
  
      return products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        quantity: product.quantity,
        category: product.category.name,
      }));
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
    }
  
    try {
      const product = await this.productRepository.findOne({
        where: { id },
      });
  
      if (!product) {
        throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
      }
  
      let category = product.category;
      if (updateProductDto.category) {
        category = await this.categoryRepository.findOne({
          where: { id: updateProductDto.category },
        });
  
        if (!category) {
          throw new HttpException('Categoría no encontrada', HttpStatus.NOT_FOUND);
        }
      }
  
      await this.productRepository.update(id, {
        ...updateProductDto,
        category,
      });
  
      return await this.productRepository.findOne({ where: { id }, relations: ['category'] });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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
