import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from '../../../prisma.service';
import {
  formatTime,
  messageTimeDisplayChatRoom,
} from '../../../shared/utils/date-time';
import { GetMessageReponse, LastMessage } from '../../../type';
import { DEFAULT_PAGE, ITEM_PER_PAGE } from 'src/constant/pagination';

@Injectable()
export class MessagesService {
  constructor(private readonly prismaService: PrismaService) {}
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

  async getAllMessageInRoom(
    roomId: string,
    page: number = DEFAULT_PAGE,
    perPage: number = ITEM_PER_PAGE,
  ): Promise<GetMessageReponse[]> {
    const messages = await this.prismaService.messages.findMany({
      where: {
        roomChatId: roomId,
      },
      select: {
        id: true,
        replyMessageId: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        messageReply: {
          select: {
            content: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return messages.reverse().map(({ user, messageReply, ...rest }: any) => {
      return {
        id: rest.id,
        sender: {
          name: user?.name,
          avatar: user?.avatar,
          id: user?.id,
        },
        messageReply: {
          message: messageReply?.content,
          name: messageReply?.user.name,
        },
        content: rest?.content,
        createdAt: formatTime(rest?.createdAt),
      };
    });
  }
}
