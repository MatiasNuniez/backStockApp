import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al crear la categoria');
    }
  }

  async findAll() {
    try {
      const categories = await this.categoryRepository.find();
      if (!categories) {
        throw new HttpException('No hay categorias', HttpStatus.NOT_FOUND);
      }
      return categories;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: number) {
    if (!id) {
      throw new HttpException(
        'El id es requerido para buscar una categoria',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        throw new HttpException('Categoria no encontrada', HttpStatus.NOT_FOUND);
      }
      return category;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al buscar la categoria');
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    if (!id) {
      throw new HttpException(
        'El id es requerido para actualizar una categoria',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        throw new HttpException('Categoria no encontrada', HttpStatus.NOT_FOUND);
      }
      return await this.categoryRepository.update(category, updateCategoryDto);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al actualizar la categoria');
    }
  }

  async remove(id: number) {
    if (!id) {
      throw new HttpException(
        'El id es requerido para eliminar una categoria',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        throw new HttpException('Categoria no encontrada', HttpStatus.NOT_FOUND);
      }
      return await this.categoryRepository.remove(category);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al eliminar la categoria');
    }
  }
}
