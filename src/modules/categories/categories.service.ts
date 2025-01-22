import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private categoryRepository: Repository<Category>) { }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new HttpException("Error al crear la categoria", HttpStatus.BAD_REQUEST);
    };
  }

  async findAll() {
    try {
      const categories = await this.categoryRepository.find();
      if (!categories) {
        throw new HttpException('No hay categorias', HttpStatus.NOT_FOUND);
      }
      return categories;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    if (!id) {
      throw new HttpException("El id es requerido para buscar una categoria", HttpStatus.BAD_REQUEST)
    } else {
      try {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) {
          throw new HttpException('Categoria no encontrada', HttpStatus.NOT_FOUND);
        }
        return category;
      } catch (error) {
        throw new HttpException("Error al buscar la categoria", HttpStatus.BAD_REQUEST)
      }
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    if (!id) {
      throw new HttpException("El id es requerido para actualizar una categoria", HttpStatus.BAD_REQUEST)
    } else {
      try {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) {
          throw new HttpException('Categoria no encontrada', HttpStatus.NOT_FOUND);
        }
        return await this.categoryRepository.update(category, updateCategoryDto);
      } catch (error) {
        throw new HttpException("Error al actualizar la categoria", HttpStatus.BAD_REQUEST)
      }
    }
  }

  async remove(id: number) {
    if (!id) {
      throw new HttpException("El id es requerido para eliminar una categoria", HttpStatus.BAD_REQUEST)
    } else {
      try {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) {
          throw new HttpException('Categoria no encontrada', HttpStatus.NOT_FOUND);
        }
        return await this.categoryRepository.remove(category);
      } catch (error) {
        throw new HttpException("Error al eliminar la categoria", HttpStatus.BAD_REQUEST)
      }
    }
  }
}
