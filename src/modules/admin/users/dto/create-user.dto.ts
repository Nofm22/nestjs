import {
  IsString,
  IsBoolean,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsInt,
} from 'class-validator';
export class CreateUserDto {
  @IsString()
  id: string;
  @IsString()
  @IsOptional()
  provider?: string;
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;
  @IsEmail()
  email?: string;
  @IsString()
  @IsOptional()
  avatar?: string;
  @IsPhoneNumber('VN')
  phoneNumber: string;
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  uid?: string;
  @IsInt()
  roleId: number;
}
