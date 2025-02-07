import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) { }

  async create(createAuthDto: CreateUserDto) {
    try {
      const user = await this.userService.findOneByEmail(createAuthDto.email);

      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      if (user.password !== createAuthDto.password) {
        throw new HttpException('Contraseña incorrecta', HttpStatus.BAD_REQUEST);
      }

      if (!process.env.JWT_SECRET) {
        throw new HttpException('Error interno del server', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      let token = jwt.sign({ id: user.id, email: user }, process.env.JWT_SECRET);

      let response = {
        token:token,
        user_id:user.id
      }
      return response;

    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async verifyToken(token: string) {
    try {
      if (!process.env.JWT_SECRET) {
        throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);

      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }


}
