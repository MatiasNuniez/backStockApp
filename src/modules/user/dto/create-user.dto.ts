import { IsEmail, IsNotEmpty, IsBoolean, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
    
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @IsString()
    @IsStrongPassword()
    password: string;

    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;

    createdAt: number;
    
    updatedAt: number;

    constructor(){
        this.createdAt = Date.now();
        this.updatedAt = Date.now();
    }
}
