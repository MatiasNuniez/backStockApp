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
      console.log(createAuthDto);
      
      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      if (user.password !== createAuthDto.password) {
        throw new HttpException('Contraseña incorrecta', HttpStatus.BAD_REQUEST);
      }

      if(!process.env.JWT_SECRET){
        throw new HttpException('Error interno del server', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      let token = jwt.sign({ id: user.id, email: user }, process.env.JWT_SECRET);

      return token;

    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
