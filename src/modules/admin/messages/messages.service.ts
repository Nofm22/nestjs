import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from '../../../prisma.service';
import { messageTimeDisplayChatRoom } from '../../../shared/utils/date-time';
import { LastMessage } from '../../../type';

@Injectable()
export class MessagesService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createMessageDto: CreateMessageDto) {
    return 'This action adds a new message';
  }

  findAll() {
    return `This action returns all messages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
  async getLastestMessageInRoom(roomId: string): Promise<LastMessage | null> {
    const message = await this.prismaService.messages.findMany({
      where: {
        roomChatId: roomId,
      },
      select: {
        content: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    if (message.length === 0) {
      return null;
    }
    const { content, createdAt, user } = message[0];
    return {
      message: content,
      senderName: user?.name as string,
      createdAt: messageTimeDisplayChatRoom(new Date(createdAt)),
    };
  }
}
