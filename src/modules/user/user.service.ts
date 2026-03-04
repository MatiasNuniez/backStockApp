import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private UserRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = this.UserRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      return await this.UserRepository.save(newUser);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll() {
    try {
      const users = await this.UserRepository.find();
      if (users) {
        return users;
      } else {
        throw new HttpException('No se encontraron usuarios', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: number) {
    if (!id) {
      throw new HttpException(
        'El id es requerido para buscar un usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const user = await this.UserRepository.findOneBy({ id });
      if (!user) {
        throw new HttpException(
          `El usuario con el id ${id} no existe`,
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOneByEmail(email: string) {
    if (!email) {
      throw new HttpException(
        'El email es requerido para buscar un usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const user = await this.UserRepository.findOneBy({ email });
      if (!user) {
        throw new HttpException(
          `El usuario con el email ${email} no existe`,
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (!id) {
      throw new HttpException(
        'El id es requerido para actualizar un usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const userUpdate = await this.UserRepository.findOneBy({ id });
      if (!userUpdate) {
        throw new HttpException(
          `El usuario con el id ${id} no existe`,
          HttpStatus.NOT_FOUND,
        );
      }
      updateUserDto.updatedAt = Date.now();
      return this.UserRepository.update(userUpdate, updateUserDto);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: number) {
    if (!id) {
      throw new HttpException(
        'El id es requerido para eliminar un usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const userDelete = await this.UserRepository.findOneBy({ id });
      if (!userDelete) {
        throw new HttpException(
          `El usuario con el id ${id} no existe`,
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.UserRepository.remove(userDelete);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}

