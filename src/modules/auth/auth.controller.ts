import { Controller, Get, Post, Body, HttpCode, HttpStatus, Headers, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async Login(@Body() createAuthDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.create(createAuthDto);
    res.cookie('token', token);
    return { msj: 'Inicio exitoso' };
  }

  @Get('verify')
  verifyToken(@Headers('Authorization') token: string) {
    return this.authService.verifyToken(token);
  }
}