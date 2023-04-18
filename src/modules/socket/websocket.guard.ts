import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../admin/users/users.service';
import { WsException } from '@nestjs/websockets';
@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: any): Promise<boolean | any> {
    try {
      const bearerToken =
        context.args[0].handshake.headers.authorization.split(' ')[1];
      const payload = this.jwtService.verify(bearerToken, {
        secret: process.env.JWT_SECRET,
      }) as any;
      if (!payload) {
        return false;
      }

      const user = await this.usersService.getUserById(payload._id);
      context.switchToHttp().getRequest().user = user;
      return Boolean(user);
    } catch (error) {
      throw new WsException(error.message);
    }
  }
}
