import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async Login(
    @Body() createAuthDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user_id, token } = await this.authService.create(createAuthDto);
    res.cookie('userId', user_id);
    res.cookie('token', token);
    return { msj: 'Inicio exitoso' };
  }
}