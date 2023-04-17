import { IsString } from 'class-validator';

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
