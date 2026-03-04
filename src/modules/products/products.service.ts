import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { UserService } from '../user/user.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    this.logger.log(`Creando producto: ${JSON.stringify(createProductDto)}`);
    try {
      // Usa los servicios de otros módulos — no inyecta repositorios ajenos
      const category = await this.categoriesService.findOne(createProductDto.category);
      const user = await this.userService.findOne(createProductDto.userId);

      const newProduct = this.productRepository.create({
        ...createProductDto,
        category,
        user,
      });

      return await this.productRepository.save(newProduct);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Incrementa el stock de un producto de forma atómica usando una transacción.
   * Previene race conditions en lecturas simultáneas.
   */
  async incrementStock(id: number, quantity: number) {
    if (!id || !quantity) {
      throw new HttpException(
        'Id o cantidad no proporcionado',
        HttpStatus.BAD_REQUEST,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOneBy(Product, { id });
      if (!product) {
        throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
      }

      product.stock += quantity;
      const saved = await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Decrementa el stock de forma atómica usando una transacción.
   * Previene que dos decrementos simultáneos lean el mismo valor de stock.
   */
  async decrementStock(id: number, quantity: number) {
    if (!id || !quantity) {
      throw new HttpException(
        'Id o cantidad no proporcionado',
        HttpStatus.BAD_REQUEST,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOneBy(Product, { id });
      if (!product) {
        throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
      }
      if (product.stock < quantity) {
        throw new HttpException('No hay suficiente stock', HttpStatus.BAD_REQUEST);
      }

      product.stock -= quantity;
      const saved = await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    try {
      const products = await this.productRepository.find({
        relations: ['category'],
      });

      if (!products.length) {
        return [];
      }

      return products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        quantity: product.quantity,
        category: product.category.name,
      }));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: number) {
    if (!id) {
      throw new HttpException('Id no proporcionado', HttpStatus.BAD_REQUEST);
    }
    try {
      const product = await this.productRepository.findOneBy({ id });
      if (!product) {
        throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
      }
      return product;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    if (!id) {
      throw new HttpException('Id no proporcionado', HttpStatus.BAD_REQUEST);
    }

    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
      }

      let category = product.category;
      if (updateProductDto.category) {
        // Delega en CategoriesService en lugar de inyectar su repo
        category = await this.categoriesService.findOne(updateProductDto.category);
      }

      await this.productRepository.update(id, { ...updateProductDto, category });

      return await this.productRepository.findOne({
        where: { id },
        relations: ['category'],
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: number) {
    if (!id) {
      throw new HttpException('Id no proporcionado', HttpStatus.BAD_REQUEST);
    }
    try {
      const product = await this.productRepository.findOneBy({ id });
      if (!product) {
        throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
      }
      return await this.productRepository.remove(product);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
