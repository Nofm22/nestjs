import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDTO } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { SUCCESS_RESPONSE } from '../../shared/utils/response-builder';
import { UsersService } from '../admin/users/users.service';
import { CreateUserDto } from '../admin/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDTO) {
    const user = await this.authService.signIn(signInDto);
    const {
      provider,
      emailVerified,
      email,
      avatar,
      phoneNumber,
      name,
      uid,
      type,
      id,
    }: SignInDTO = signInDto;
    let _id: string;
    let accessToken: string;
    if (!user) {
      const data: CreateUserDto = {
        id,
        provider: provider !== '' ? provider : undefined,
        emailVerified: emailVerified === true ? emailVerified : undefined,
        email,
        avatar: avatar !== '' ? avatar : undefined,
        phoneNumber,
        name,
        uid: uid !== '' ? uid : undefined,
        roleId: type === 'create' ? 2 : 0,
      };

      const newUser = await this.userService.createNewUser(data);
      _id = newUser.id;
    } else {
      _id = user.id;
    }
    accessToken = this.jwtService.sign({
      _id,
      role: user?.roleId,
    });
    return SUCCESS_RESPONSE({
      user: Object.assign({}, { ...user, role: user?.roleId }, { _id }),
      accessToken,
    });
  }
}
