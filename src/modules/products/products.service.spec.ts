import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { UserService } from '../user/user.service';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

// ---------- Fixtures ----------
const makeProduct = (stock: number): Product =>
  ({ id: 1, name: 'Widget', price: 10, stock, quantity: 1 } as Product);

// Mock del QueryRunner que simula transacciones de TypeORM
const makeQueryRunner = (product: Product | null) => ({
  connect: jest.fn().mockResolvedValue(undefined),
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  release: jest.fn().mockResolvedValue(undefined),
  manager: {
    findOneBy: jest.fn().mockResolvedValue(product),
    save: jest.fn().mockImplementation((p: Product) => Promise.resolve(p)),
  },
});

const mockProductRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockCategoriesService = { findOne: jest.fn() };
const mockUserService = { findOne: jest.fn() };

// ---------- Suite ----------
describe('ProductsService', () => {
  let service: ProductsService;
  let mockDataSource: { createQueryRunner: jest.Mock };

  beforeEach(async () => {
    mockDataSource = { createQueryRunner: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useFactory: mockProductRepo },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: UserService, useValue: mockUserService },
        // DataSource se registra con la clase como token DI en TypeORM/NestJS
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  // ── incrementStock ────────────────────────────────────────────────────────

  describe('incrementStock', () => {
    it('debe incrementar el stock correctamente', async () => {
      const product = makeProduct(10);
      const qr = makeQueryRunner(product);
      mockDataSource.createQueryRunner.mockReturnValue(qr);

      const result = await service.incrementStock(1, 5);

      expect(result.stock).toBe(15);
      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(qr.rollbackTransaction).not.toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
    });

    it('debe hacer rollback y lanzar 404 si el producto no existe', async () => {
      const qr = makeQueryRunner(null);
      mockDataSource.createQueryRunner.mockReturnValue(qr);

      await expect(service.incrementStock(999, 5)).rejects.toThrow(
        new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND),
      );

      expect(qr.rollbackTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
    });

    it('debe lanzar 400 si id es 0 o quantity es 0', async () => {
      await expect(service.incrementStock(0, 5)).rejects.toThrow(
        new HttpException('Id o cantidad no proporcionado', HttpStatus.BAD_REQUEST),
      );
      await expect(service.incrementStock(1, 0)).rejects.toThrow(
        new HttpException('Id o cantidad no proporcionado', HttpStatus.BAD_REQUEST),
      );
    });

    it('siempre llama a release() incluso si hay error', async () => {
      const qr = makeQueryRunner(null);
      mockDataSource.createQueryRunner.mockReturnValue(qr);

      await expect(service.incrementStock(999, 5)).rejects.toThrow();
      expect(qr.release).toHaveBeenCalled();
    });
  });

  // ── decrementStock ────────────────────────────────────────────────────────

  describe('decrementStock', () => {
    it('debe decrementar el stock correctamente', async () => {
      const product = makeProduct(10);
      const qr = makeQueryRunner(product);
      mockDataSource.createQueryRunner.mockReturnValue(qr);

      const result = await service.decrementStock(1, 3);

      expect(result.stock).toBe(7);
      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
    });

    it('debe lanzar 400 si el stock disponible es insuficiente', async () => {
      const product = makeProduct(2);
      const qr = makeQueryRunner(product);
      mockDataSource.createQueryRunner.mockReturnValue(qr);

      await expect(service.decrementStock(1, 10)).rejects.toThrow(
        new HttpException('No hay suficiente stock', HttpStatus.BAD_REQUEST),
      );

      expect(qr.rollbackTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
    });

    it('no debe dejar el stock en negativo', async () => {
      const product = makeProduct(5);
      const qr = makeQueryRunner(product);
      mockDataSource.createQueryRunner.mockReturnValue(qr);

      await expect(service.decrementStock(1, 6)).rejects.toThrow(
        new HttpException('No hay suficiente stock', HttpStatus.BAD_REQUEST),
      );
    });

    it('debe hacer rollback y lanzar 404 si el producto no existe', async () => {
      const qr = makeQueryRunner(null);
      mockDataSource.createQueryRunner.mockReturnValue(qr);

      await expect(service.decrementStock(999, 1)).rejects.toThrow(
        new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND),
      );

      expect(qr.rollbackTransaction).toHaveBeenCalled();
    });

    it('siempre llama a release() incluso si hay error', async () => {
      const qr = makeQueryRunner(null);
      mockDataSource.createQueryRunner.mockReturnValue(qr);

      await expect(service.decrementStock(999, 1)).rejects.toThrow();
      expect(qr.release).toHaveBeenCalled();
    });
  });
});
