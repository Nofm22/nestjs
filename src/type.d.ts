export interface UserCreateInput {
  id: string;
}

export interface Member {
  name?: string | null;
  avatar?: string | null;
  id: string;
}

export interface GetAllRoomResponseType {
  createdUserId: string;
  title: string | null;
  createdAt: number;
  members?: Member[] | null;
  id: string;
}

export interface LastMessage {
  message: string;
  senderName: string;
  createdAt: string;
}

export interface GetUserInRoomResponse extends Member {
  email: string;
  phoneNumber: string;
  role: string;
}

export interface MessageReply {
  message: string | null;
  name: string | null;
}

export interface GetMessageReponse {
  sender: Member;
  id: string;
  content: string;
  createdAt: number | string;
}
