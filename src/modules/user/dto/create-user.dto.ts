import { IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from "class-validator";
export class CreateUserDto {
    @IsString()
    @MaxLength(50)
    @IsNotEmpty()
    readonly name: string;

    @IsEmail()
    @IsNotEmpty()
    readonly email: string; 
    
    @IsNumber()
    @IsNotEmpty()
    // @MinLength(8, { message: 'Mobile number must be at least 9 digits' })
    // @MaxLength(11, { message: 'Mobile number cannot exceed 10 digits' })
    readonly mobileNumber: number;
    
    @IsString()
    @IsNotEmpty()   
    readonly password: string;
}