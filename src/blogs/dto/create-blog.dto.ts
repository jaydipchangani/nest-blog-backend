import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
  title: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
  excerpt?: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
  content: string;

  @IsOptional()
@IsBoolean()
@Transform(({ value }) => {
  if (Array.isArray(value)) value = value[0];
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
})
paid?: boolean;

}
