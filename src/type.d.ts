export interface AddUserInRoomCreateInput {
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
