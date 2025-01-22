import { Column, PrimaryGeneratedColumn } from "typeorm";

export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    price: number;

    @Column()
    stock: number;

    @Column()
    category: number;

    @Column()
    dateSell: number;

}
