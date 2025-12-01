import { ApiProperty } from "@nestjs/swagger";
import { UserResponseDto } from "../user/user-response.dto";

export class LoginResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT Access Token",
  })
  accessToken: string;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT Refresh Token",
  })
  refreshToken: string;

  constructor(
    user: UserResponseDto,
    accessToken: string,
    refreshToken: string
  ) {
    this.user = user;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
