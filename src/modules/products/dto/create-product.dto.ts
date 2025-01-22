import { IsNotEmpty, IsString, IsNumber, IsDate, IsDateString} from "class-validator";


export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsNumber()
    stock: number;

    @IsNotEmpty()
    @IsNumber()
    category: number;
    
    @IsDateString()
    dateSell: number;
}