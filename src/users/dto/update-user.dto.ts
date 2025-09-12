import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Role } from '../../common/enums/roles.enum';

export class UpdateUserDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  subscription?: boolean;
}
