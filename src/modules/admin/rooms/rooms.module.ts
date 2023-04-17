import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { PrismaService } from 'src/prisma.service';
import { MessagesService } from '../messages/messages.service';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, PrismaService, MessagesService],
})
export class RoomsModule {}
