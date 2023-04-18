import { IsString, IsNumber, IsOptional } from 'class-validator';
import { UserCreateInput } from '../../../../type';
import { Transform } from 'class-transformer';
import { toNumber } from '../../../../common/helper/casts.helper';

export class CreateRoomDto {
  @IsString()
  title: string;
  @IsString()
  userId: string;
}

export class CreatePrivateRoomDto {
  @IsString()
  userId: string;
}

export class AddUserInRoomDto {
  users: UserCreateInput[];
  @IsString()
  roomId: string;
}

export class QueryDto {
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  page: number;

  @IsString()
  @IsOptional()
  roomId: string;
}

export class RemoveUserFromRoomDto {
  users: UserCreateInput[];
  @IsString()
  roomId: string;
}
