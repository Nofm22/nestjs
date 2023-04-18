import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../../../prisma.service';
import {
  UserCreateInput,
  GetAllRoomResponseType,
  Member,
  GetUserInRoomResponse,
} from '../../../type';
import { DEFAULT_PAGE, ITEM_PER_PAGE } from '../../../constant/pagination';
import { convertTimeStamp } from '../../../shared/utils/date-time';

@Injectable()
export class RoomsService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createRoomDto: CreateRoomDto, isGroupChat: boolean = true) {
    const { title, userId } = createRoomDto;
    return await this.prismaService.roomChat.create({
      data: {
        title,
        createdUserId: userId,
        isGroupChat,
      },
    });
  }
  async addUSerInRoomByAdmin(
    users: UserCreateInput[],
    roomId: string,
  ): Promise<any> {
    return users.map(async ({ id }) => {
      return await this.prismaService.userRoomChat.create({
        data: {
          userId: id,
          roomId,
        },
      });
    });
  }
  async getAllRooms(
    page = DEFAULT_PAGE,
    perPage = ITEM_PER_PAGE,
  ): Promise<GetAllRoomResponseType[]> {
    const rooms = await this.prismaService.roomChat.findMany({
      where: {
        AND: [
          {
            status: true,
          },
          {
            isGroupChat: true,
          },
        ],
      },
      select: {
        id: true,
        createdUserId: true,
        title: true,
        createdAt: true,
        userRoomChat: {
          select: {
            isInRoom: true,
            user: {
              select: {
                name: true,
                avatar: true,
                id: true,
              },
            },
          },
        },
      },
      take: perPage * 1,
      skip: (page - 1) * perPage,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return rooms.map(({ userRoomChat, ...room }) => {
      const members: Member[] | null = userRoomChat
        ?.filter(({ isInRoom }) => isInRoom)
        .map(({ user }) => user) as Member[];
      return {
        ...room,
        createdAt: convertTimeStamp(room.createdAt),
        members,
      };
    });
  }

  async checkExistPrivateRoom(
    userOne: string,
    userTwo: string,
  ): Promise<string | null> {
    const rooms = await this.prismaService.roomChat.findMany({
      where: {
        isGroupChat: false,
      },
      select: {
        id: true,
        userRoomChat: {
          select: {
            userId: true,
          },
        },
      },
    });
    let isExists: boolean = false;
    let roomId: string | null = null;
    rooms?.forEach(({ id, userRoomChat }) => {
      if (
        userRoomChat.some(({ userId }) => userId === userOne) &&
        userRoomChat.some(({ userId }) => userId === userTwo)
      ) {
        isExists = true;
        roomId = id;
      }
    });
    if (!isExists) {
      return null;
    } else {
      return roomId;
    }
  }
  async countNumberRoomCreated(): Promise<number> {
    return this.prismaService.roomChat.count({
      where: {
        status: true,
      },
    });
  }

  async getRoomDetail(roomId: string): Promise<any> {
    const room = await this.prismaService.roomChat.findUnique({
      where: {
        id: roomId,
      },
      select: {
        id: true,
        createdAt: true,
        title: true,
        isGroupChat: true,
        user: {
          select: {
            id: true,
            avatar: true,
            name: true,
            role: {
              select: {
                title: true,
              },
            },
          },
        },
        userRoomChat: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                email: true,
                phoneNumber: true,
                role: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const { createdAt, user, userRoomChat, ...rest }: any = room;
    return {
      ...rest,
      createdAt: convertTimeStamp(createdAt),
      createdUser: {
        ...user,
        role: user.role.title,
      },
      members: userRoomChat.map(({ user }) => {
        return {
          ...user,
          role: user.role.title,
        };
      }),
    };
  }

  async getMyRooms(
    userId: string,
    page: number = DEFAULT_PAGE,
    perPage = ITEM_PER_PAGE,
  ): Promise<GetAllRoomResponseType[]> {
    const rooms = await this.prismaService.roomChat.findMany({
      where: {
        AND: [
          {
            status: true,
          },
          {
            userRoomChat: {
              some: {
                userId,
              },
            },
          },
          {
            isGroupChat: false,
          },
        ],
      },
      select: {
        id: true,
        createdUserId: true,
        title: true,
        createdAt: true,
        userRoomChat: {
          select: {
            isInRoom: true,
            user: {
              select: {
                name: true,
                avatar: true,
                id: true,
              },
            },
          },
        },
      },
      take: perPage * 1,
      skip: (page - 1) * perPage,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return rooms.map(({ userRoomChat, ...room }) => {
      const members: Member[] | null = userRoomChat
        ?.filter(({ isInRoom }) => isInRoom)
        .map(({ user }) => user) as Member[];
      return {
        ...room,
        createdAt: convertTimeStamp(room.createdAt),
        members,
      };
    });
  }

  async removeUserFromRoom(
    users: UserCreateInput[],
    roomId: string,
  ): Promise<any> {
    return users.map(async ({ id }) => {
      return await this.prismaService.userRoomChat.updateMany({
        where: {
          AND: [
            {
              userId: id,
            },
            {
              roomId,
            },
          ],
        },
        data: {
          isInRoom: false,
        },
      });
    });
  }

  async getUserInRoom(roomId: string): Promise<GetUserInRoomResponse[]> {
    const users = await this.prismaService.userRoomChat.findMany({
      where: {
        AND: [
          {
            roomId,
          },
          {
            isInRoom: true,
          },
        ],
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            role: {
              select: {
                title: true,
              },
            },
            avatar: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
    return users.map(({ user }) => {
      const { role, ...rest }: any = user;
      return {
        ...rest,
        role: role.title,
      };
    });
  }

  async removeRoomByAdmin(roomId: string): Promise<any> {
    return await this.prismaService.roomChat.updateMany({
      where: {
        AND: [
          {
            id: roomId,
          },
          {
            isGroupChat: true,
          },
        ],
      },
      data: {
        status: false,
      },
    });
  }
}
