import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

// ---------- Fixture ----------
const mockUser: Partial<User> = {
  id: 1,
  email: 'user@test.com',
  password: '$2b$10$hashedpasswordfixture',
  isActive: true,
};

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

// ---------- Suite ----------
describe('UserService', () => {
  let service: UserService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  // ── findOneByEmail ────────────────────────────────────────────────────────

  describe('findOneByEmail', () => {
    it('debe retornar el usuario cuando existe', async () => {
      repo.findOneBy.mockResolvedValue(mockUser as User);

      const result = await service.findOneByEmail('user@test.com');

      expect(result).toEqual(mockUser);
      expect(repo.findOneBy).toHaveBeenCalledWith({ email: 'user@test.com' });
    });

    it('debe lanzar 404 cuando el email no existe', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOneByEmail('noexiste@test.com')).rejects.toThrow(
        new HttpException(
          'El usuario con el email noexiste@test.com no existe',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('debe lanzar 400 cuando el email no se provee', async () => {
      await expect(service.findOneByEmail('')).rejects.toThrow(
        new HttpException(
          'El email es requerido para buscar un usuario',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('debe hashear la contraseña antes de guardar', async () => {
      const hashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashed_password' as never);
      repo.create.mockReturnValue({ ...mockUser, password: 'hashed_password' } as User);
      repo.save.mockResolvedValue({ ...mockUser, password: 'hashed_password' } as User);

      await service.create({
        email: 'new@test.com',
        password: 'PlainPass1!',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      expect(hashSpy).toHaveBeenCalledWith('PlainPass1!', 10);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed_password' }),
      );
    });

    it('la contraseña guardada no debe ser texto plano', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password' as never);
      repo.create.mockReturnValue({ ...mockUser, password: 'hashed_password' } as User);
      const saved = { ...mockUser, password: 'hashed_password' } as User;
      repo.save.mockResolvedValue(saved);

      const result = await service.create({
        email: 'new@test.com',
        password: 'PlainPass1!',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      expect(result.password).not.toBe('PlainPass1!');
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('debe lanzar 404 cuando el id no existe', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new HttpException(
          'El usuario con el id 999 no existe',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('debe lanzar 400 cuando el id es 0 o falsy', async () => {
      await expect(service.findOne(0)).rejects.toThrow(
        new HttpException(
          'El id es requerido para buscar un usuario',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
