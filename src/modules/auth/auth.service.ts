import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateUserDto) {
    const user = await this.userService.findOneByEmail(createAuthDto.email);

    const passwordMatch = await bcrypt.compare(
      createAuthDto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });

    return {
      token,
      user_id: user.id,
    };
  }
}

