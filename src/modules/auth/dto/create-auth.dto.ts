import { IsEmail, IsString, IsBoolean, IsPhoneNumber } from 'class-validator';
export class CreateAuthDto {}

export class SignInDTO {
  @IsString()
  id: string;

  @IsString()
  provider: string;

  @IsBoolean()
  emailVerified: boolean;

  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  avatar: string;

  @IsPhoneNumber('VN')
  phoneNumber: string;

  @IsString()
  name: string;
  uid: string;
  type: string;
}
