import { Module } from '@nestjs/common';
import { ChatWebsocketGateway } from './websocket.gateway';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../admin/users/users.service';
import { PrismaService } from '../../prisma.service';

@Module({
  providers: [ChatWebsocketGateway, JwtService, UsersService, PrismaService],
})
export class WebSocketModule {}
