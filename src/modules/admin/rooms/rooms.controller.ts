import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CurrentUser } from '../../../decorators/user.decorator';
import { JwtAuthGuard } from '../../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../../modules/auth/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { Role } from '../../../enum/roles.enum';
import {
  ERROR_RESPONSE,
  SUCCESS_RESPONSE,
  handleError,
} from '../../../shared/utils/response-builder';
import { Response } from 'express';
import { AddUserInRoomCreateInput } from '../../../type';
import { MessagesService } from '../messages/messages.service';
import { CreatePrivateRoomDto } from './dto/create-room.dto';
import { UsersService } from '../users/users.service';
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly messageService: MessagesService,
    private readonly userService: UsersService,
  ) {}

  @Post('create')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@CurrentUser('id') userId, @Res() res: Response) {
    try {
      const numberRoomCreated =
        await this.roomsService.countNumberRoomCreated();
      const title = 'Phòng ' + numberRoomCreated;
      const room = await this.roomsService.create({ title, userId });
      if (!room) {
        res.status(HttpStatus.BAD_REQUEST).send(
          ERROR_RESPONSE({
            errors: ["Can't create room."],
          }),
        );

        return;
      }
      // Assign user in room chat
      const users: AddUserInRoomCreateInput[] = [{ id: userId }];
      await this.roomsService.addUSerInRoomByAdmin(users, room.id);
      const rooms = await this.roomsService.getAllRooms();
      const roomsFormatted = await Promise.all(
        rooms.map(async ({ id, ...rest }) => {
          const lastMessage = await this.messageService.getLastestMessageInRoom(
            id,
          );
          return {
            ...rest,
            id,
            lastMessage,
          };
        }),
      );
      return res.send(
        SUCCESS_RESPONSE({
          rooms: roomsFormatted,
        }),
      );
    } catch (e) {
      handleError(e);
    }
  }

  @Post('create-private-room')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createPrivateRoom(
    @CurrentUser('id') createdUserId,
    @Res() res: Response,
    @Body() data: CreatePrivateRoomDto,
  ) {
    const { userId } = data;
    const user = await this.userService.getUserById(userId);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send(
        ERROR_RESPONSE({
          errors: ['Không tìm thấy user'],
        }),
      );
    }

    // Check isExists group chat private between 2 user
    const roomExist = await this.roomsService.checkExistPrivateRoom(
      createdUserId,
      userId,
    );
    if (roomExist) {
      res.send(
        SUCCESS_RESPONSE({
          room: {
            roomId: roomExist,
          },
        }),
      );
    }
    const title: string = user.name as string;
    const isGroupChat: boolean = false;
    const room = await this.roomsService.create(
      { title, userId: createdUserId },
      isGroupChat,
    );

    if (!room) {
      return res.status(HttpStatus.BAD_REQUEST).send(
        ERROR_RESPONSE({
          errors: ['Không thể tạo phòng'],
        }),
      );
    }
    // Assign user in room chat
    const users: AddUserInRoomCreateInput[] = [
      { id: createdUserId },
      { id: userId },
    ];
    await this.roomsService.addUSerInRoomByAdmin(users, room.id);

    return res.send(
      SUCCESS_RESPONSE({
        room: {
          roomId: room.id,
        },
      }),
    );
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(+id);
  }
}
