import { Injectable } from '@nestjs/common';
import { SignInDTO } from './dto/create-auth.dto';
import { UsersService } from '../admin/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signIn(data: SignInDTO) {
    const { id: userId } = data;
    return await this.usersService.getUserById(userId);
    // if (user?.password !== pass) {
    //   throw new UnauthorizedException();
    // }
    // const payload = { username: user.username, sub: user.userId };
    // return {
    //   access_token: await this.jwtService.signAsync(payload),
    // };
  }
}
