  import { IsEmail, IsNotEmpty, MinLength , IsOptional} from 'class-validator';

  export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    name: string;

    @IsOptional()
    role?: 'user' | 'admin';  // Add this

    @IsOptional()
    subscription?: boolean;
  }
