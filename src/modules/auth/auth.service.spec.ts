import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

// ---------- Helpers ----------
const HASHED = '$2b$10$hashedpasswordfixture';
const mockUser = { id: 1, email: 'test@test.com', password: HASHED };

const mockUserService = {
  findOneByEmail: jest.fn(),
};
const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed.jwt.token'),
};

// ---------- Suite ----------
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── create / login ────────────────────────────────────────────────────────

  describe('create (login)', () => {
    it('debe devolver token y user_id cuando las credenciales son correctas', async () => {
      mockUserService.findOneByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.create({
        email: mockUser.email,
        password: 'ValidPass1!',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      expect(result).toEqual({ token: 'signed.jwt.token', user_id: 1 });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
      });
    });

    it('debe lanzar UnauthorizedException cuando la contraseña es incorrecta', async () => {
      mockUserService.findOneByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.create({
          email: mockUser.email,
          password: 'WrongPass1!',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      ).rejects.toThrow('Contraseña incorrecta');
    });

    it('debe propagar HttpException cuando el usuario no existe (404 de UserService)', async () => {
      mockUserService.findOneByEmail.mockRejectedValue(
        new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND),
      );

      await expect(
        service.create({
          email: 'noexiste@test.com',
          password: 'ValidPass1!',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      ).rejects.toThrow(HttpException);
    });

    it('el token JWT debe contener id y email — no el objeto User completo', async () => {
      mockUserService.findOneByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await service.create({
        email: mockUser.email,
        password: 'ValidPass1!',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Verifica que el payload NO incluya el objeto user completo (bug original)
      const signCall = mockJwtService.sign.mock.calls[0][0];
      expect(signCall).toStrictEqual({ id: 1, email: 'test@test.com' });
      expect(signCall.password).toBeUndefined();
    });
  });
});
