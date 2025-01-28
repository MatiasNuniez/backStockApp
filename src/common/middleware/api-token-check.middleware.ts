import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ApiCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new HttpException(
        'El token de autorización es obligatorio en el encabezado Authorization',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!authorization.startsWith('Bearer ')) {
      throw new HttpException(
        'Formato de token inválido. Debe comenzar con "Bearer <token>"',
        HttpStatus.BAD_REQUEST,
      );
    }

    const token = authorization.split(' ')[1];

    try {
      const secretKey = process.env.JWT_SECRET;
      if(!secretKey) {
        throw new HttpException('Error al validar el token', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      jwt.verify(token, secretKey);

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new HttpException('El token ha expirado', HttpStatus.UNAUTHORIZED);
      } else if (err.name === 'JsonWebTokenError') {
        throw new HttpException('Token inválido', HttpStatus.UNAUTHORIZED);
      } else {
        throw new HttpException('Error al validar el token', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
