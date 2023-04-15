import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { users } from '@prisma/client';
import { handleError } from 'src/shared/utils/response-builder';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async getUserById(userId: string): Promise<users | null> {
    return await this.prismaService.users.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async createNewUser(data: any): Promise<users> {
    return await this.prismaService.users.create({
      data,
    });
  }

  async updateUserById(_id: string, data: any): Promise<users | null> {
    return await this.prismaService.users.update({
      where: {
        id: _id,
      },
      data,
    });
  }

  async approveWriter(_id: string): Promise<any> {
    return this.prismaService.users.update({
      where: {
        id: _id,
      },
      data: {
        roleId: 3,
      },
    });
  }
}
