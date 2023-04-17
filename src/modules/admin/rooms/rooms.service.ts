import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../../../prisma.service';
import {
  AddUserInRoomCreateInput,
  GetAllRoomResponseType,
  Member,
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
    users: AddUserInRoomCreateInput[],
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
  findAll() {
    return `This action returns all rooms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }

  async countNumberRoomCreated(): Promise<number> {
    return this.prismaService.roomChat.count({
      where: {
        status: true,
      },
    });
  }
}
