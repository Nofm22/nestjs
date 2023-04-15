import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsInt,
} from 'class-validator';

export class UpdateUserDto {
  @IsInt()
  @IsOptional()
  roleId?: number;
  @IsPhoneNumber('VN')
  @IsOptional()
  phoneNumber?: string;
  @IsString()
  @IsOptional()
  avatar?: string;
  @IsString()
  @IsOptional()
  name?: string;
  @IsEmail()
  @IsOptional()
  email?: string;
}
