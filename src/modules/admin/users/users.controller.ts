import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Req,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CurrentUser } from '../../../decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { Role } from '../../../enum/roles.enum';
import {
  ERROR_RESPONSE,
  SUCCESS_RESPONSE,
  handleError,
} from '../../../shared/utils/response-builder';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Get(':id')
  @Roles(Role.Customers)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@CurrentUser('name') name: string) {
    return SUCCESS_RESPONSE({
      msg: name,
    });
  }

  @Post(':_id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateUser(@Req() req, @Param() params, @Res() res: Response) {
    try {
      const { _id } = params;
      const {
        user: { role, phoneNumber, avatar, name, email },
      } = req.body;
      if (role !== 2 && role !== 4) {
        res.status(HttpStatus.BAD_REQUEST).send(
          ERROR_RESPONSE({
            errors: 'Role is invalid',
          }),
        );

        return;
      }
      await this.usersService.updateUserById(_id, {
        roleId: role,
        phoneNumber,
        avatar,
        name,
        email,
      });
      const accessToken = this.jwtService.sign({
        _id,
        role,
      });

      return res.send(SUCCESS_RESPONSE({ role, accessToken }));
    } catch (e) {
      console.log(e);
      handleError(e);
    }
  }
  @Post(':_id/approve-writer')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async approveWriter(@Res() res: Response, @Param() params) {
    try {
      const { _id } = params;

      const user = await this.usersService.getUserById(_id);

      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).send(
          ERROR_RESPONSE({
            errors: 'User not found!',
          }),
        );
      }
      const response = await this.usersService.approveWriter(_id);
      if (!response) {
        return res.status(HttpStatus.NOT_FOUND).send(
          ERROR_RESPONSE({
            errors: ['Something went wrong'],
          }),
        );
      }

      return res.send(SUCCESS_RESPONSE({}));
    } catch (e) {
      console.log(e);
      handleError(e);
    }
  }
}
