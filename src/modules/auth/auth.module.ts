import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from 'src/prisma.service';
import { UsersModule } from '../admin/users/users.module';
import { UsersService } from '../admin/users/users.service';
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, PrismaService, UsersService],
  controllers: [AuthController],
})
export class AuthModule {}
