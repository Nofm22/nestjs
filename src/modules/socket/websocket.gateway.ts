import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from '../../decorators/user.decorator';
import { WsGuard } from './websocket.guard';
import { Req } from '@nestjs/common';
import { Request } from 'express';
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:8080',
      'https://app.wecontent.vn',
      'https://staging.wecontent.vn',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
})
export class ChatWebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly jwtService: JwtService) {}
  @WebSocketServer() server: Server;
  handleConnection(socket: Socket): void {
    // const token = socket.handshake.headers.authorization?.split(' ')[1];
    // if (!token) {
    //   socket.disconnect();
    //   return;
    // }
    // const { _id } = this.jwtService.verify(token, {
    //   secret: process.env.JWT_SECRET,
    // });
    //console.log(userId);
    const socketId = socket.id;
    console.log(`New connecting... socket id:`, socketId);
  }

  handleDisconnect(socket: Socket): void {
    const socketId = socket.id;
    console.log(`Disconnection... socket id:`, socketId);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(socket: Socket, roomId: string): void {
    console.log(roomId);
  }
}
