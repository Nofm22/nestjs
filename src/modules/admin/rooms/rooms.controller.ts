import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Res,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
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
import {
  UserCreateInput,
  GetAllRoomResponseType,
  GetUserInRoomResponse,
} from '../../../type';
import { MessagesService } from '../messages/messages.service';
import { CreatePrivateRoomDto, QueryDto } from './dto/create-room.dto';
import { UsersService } from '../users/users.service';

@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly messageService: MessagesService,
    private readonly userService: UsersService,
  ) {}
  @Post('create')
  async create(@CurrentUser('id') userId: string, @Res() res: Response) {
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
      const users: UserCreateInput[] = [{ id: userId }];
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
  async createPrivateRoom(
    @CurrentUser('id') createdUserId: string,
    @Res() res: Response,
    @Body() data: CreatePrivateRoomDto,
  ) {
    try {
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
      if (!!roomExist) {
        return res.send(
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
      const users: UserCreateInput[] = [{ id: createdUserId }, { id: userId }];
      await this.roomsService.addUSerInRoomByAdmin(users, room.id);

      return res.send(
        SUCCESS_RESPONSE({
          room: {
            roomId: room.id,
          },
        }),
      );
    } catch (error) {
      handleError(error);
    }
  }

  @Post('add-user')
  async addUserInRoom(
    @CurrentUser('id') userId: string,
    @Res() res: Response,
    @Body() data,
  ) {
    try {
      const { users, roomId } = data;
      console.log(data);
      const room = await this.roomsService.getRoomDetail(roomId);
      if (!room) {
        return res.status(HttpStatus.NOT_FOUND).send(
          ERROR_RESPONSE({
            errors: ['Không tìm thấy phòng.'],
          }),
        );
      }
      const { isGroupChat }: any = room;
      if (!isGroupChat) {
        return res.status(HttpStatus.BAD_REQUEST).send(
          ERROR_RESPONSE({
            errors: ['Thêm thành viên không thành công.'],
          }),
        );
      }
      const { createdUser } = room;
      if (createdUser.id !== userId) {
        return res.status(HttpStatus.NOT_FOUND).send(
          ERROR_RESPONSE({
            errors: ['Bạn không phải chủ room.'],
          }),
        );
      }
      const isSuccess = await this.roomsService.addUSerInRoomByAdmin(
        users,
        roomId,
      );

      if (!isSuccess) {
        return res.status(HttpStatus.BAD_REQUEST).send(
          ERROR_RESPONSE({
            errors: ['Thêm thành viên không thành công.'],
          }),
        );
      }

      res.send(SUCCESS_RESPONSE({}));
    } catch (error) {
      console.log(error);
      handleError(error);
    }
  }

  @Get('get-all-rooms')
  async getAllRooms(@Res() res: Response, @Query() query: QueryDto) {
    const { page } = query;
    const rooms = await this.roomsService.getAllRooms(page);

    if (!rooms) {
      return res.status(HttpStatus.NOT_FOUND).send(
        ERROR_RESPONSE({
          errors: ['Không tìm thấy phòng,'],
        }),
      );
    }
    const roomsFormatted: GetAllRoomResponseType[] = await Promise.all(
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
  }

  @Get('get-my-rooms')
  async getMyRooms(
    @Res() res: Response,
    @Query() query: QueryDto,
    @CurrentUser('id') userId: string,
  ) {
    const { page } = query;
    const rooms = await this.roomsService.getMyRooms(userId, page);
    if (!rooms) {
      return res.status(HttpStatus.NOT_FOUND).send(
        ERROR_RESPONSE({
          errors: ['Không tìm thấy phòng.'],
        }),
      );
    }
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
  }

  @Post('remove-user')
  async removeUserFromRoom(
    @Res() res: Response,
    @CurrentUser('id') createdUserId: string,
    @Body() data,
  ) {
    try {
      const { users, roomId } = data;
      console.log(data);
      const room = await this.roomsService.getRoomDetail(roomId);

      if (!room) {
        return res.status(HttpStatus.NOT_FOUND).send(
          ERROR_RESPONSE({
            errors: ['Không tìm thấy phòng'],
          }),
        );
      }
      const { createdUser } = room;
      if (createdUser.id !== createdUserId) {
        return res.status(HttpStatus.NOT_FOUND).send(
          ERROR_RESPONSE({
            errors: ['Bạn không có quyền thực hiện điều này.'],
          }),
        );
      }
      const rooms = await this.roomsService.removeUserFromRoom(users, roomId);

      if (!rooms) {
        return res.status(HttpStatus.NOT_FOUND).send(
          ERROR_RESPONSE({
            errors: ['Không thể xóa người dùng khỏi phòng.'],
          }),
        );
      }
      return res.send(SUCCESS_RESPONSE({}));
    } catch (error) {
      console.log(error);
      handleError(error);
    }
  }

  @Get('get-users-room')
  async getUserInRoom(@Res() res: Response, @Query() query: QueryDto) {
    try {
      const { roomId } = query;

      const users: GetUserInRoomResponse[] =
        await this.roomsService.getUserInRoom(roomId);

      if (!users || users.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).send(
          ERROR_RESPONSE({
            errors: ['Không tìm thấy users.'],
          }),
        );
      }

      return res.send(SUCCESS_RESPONSE({ users }));
    } catch (error) {
      console.log(error);
      handleError(error);
    }
  }

  @Get(':_id')
  async getRoomDetail(@Res() res: Response, @Param() params) {
    try {
      const { _id: roomId } = params;
      const room = await this.roomsService.getRoomDetail(roomId);
      if (!room) {
        return res.status(HttpStatus.NOT_FOUND).send(
          ERROR_RESPONSE({
            errors: ['Không tim thấy phòng.'],
          }),
        );
      }
      return res.send(
        SUCCESS_RESPONSE({
          room,
        }),
      );
    } catch (error) {
      console.log(error);
      handleError(error);
    }
  }

  @Post(':_id/remove')
  async removeRoomByAdmin(
    @Res() res: Response,
    @Param() params,
    @CurrentUser('id') userId,
  ) {
    try {
      const { _id: roomId } = params;
      const room = await this.roomsService.getRoomDetail(roomId);
      if (!room) {
        return res.status(HttpStatus.NOT_FOUND).send(
          ERROR_RESPONSE({
            errors: ['Không tìm thấy phòng.'],
          }),
        );
      }
      const { createdUser } = room;
      if (createdUser.id !== userId) {
        return res.status(HttpStatus.NOT_FOUND).send(
          ERROR_RESPONSE({
            errors: ['Bạn không phải chủ room.'],
          }),
        );
      }
      const isDeleted = await this.roomsService.removeRoomByAdmin(roomId);
      if (isDeleted.count === 0) {
        return res.status(HttpStatus.BAD_REQUEST).send(
          ERROR_RESPONSE({
            errors: ['Không thể xóa phòng.'],
          }),
        );
      }
      res.status(HttpStatus.OK).send(SUCCESS_RESPONSE({}));
    } catch (error) {
      handleError(error);
    }
  }

  @Get(':_id/messages')
  async getMessagesInRoom(
    @Res() res: Response,
    @Param() params,
    @Query() query: QueryDto,
  ) {
    try {
      const { _id: roomId } = params;
      const { page } = query;
      const messages = await this.messageService.getAllMessageInRoom(
        roomId,
        page,
      );
    } catch (error) {
      console.log(error);
      handleError(error);
    }
  }
}
