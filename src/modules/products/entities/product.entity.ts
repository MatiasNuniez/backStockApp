import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column("decimal", { precision: 5, scale: 2 })
    price: number;

    @Column()
    stock: number;

    @Column()
    quantity: number;

    @Column()
    category: number;

}
