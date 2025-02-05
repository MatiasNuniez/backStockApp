import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Product } from "src/modules/products/entities/product.entity";

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}