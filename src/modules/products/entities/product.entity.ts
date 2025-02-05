import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "../../categories/entities/category.entity"

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column('decimal')
    price: number;
  
    @Column()
    stock: number;
  
    @Column()
    quantity: number;
  
    @ManyToOne(() => Category, (category) => category.products, { nullable: false, onDelete: 'CASCADE' })
    category: Category;
}
