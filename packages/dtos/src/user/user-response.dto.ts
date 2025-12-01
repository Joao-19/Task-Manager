import { ApiProperty } from "@nestjs/swagger";
import { IUser } from "./user.interface";

export class UserResponseDto {
  @ApiProperty({ example: "uuid-1234", description: "User ID" })
  id: string;

  @ApiProperty({ example: "joaodev", description: "Username" })
  username: string;

  @ApiProperty({ example: "joao@test.com", description: "User email" })
  email: string;

  constructor(user: IUser) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
  }
}
