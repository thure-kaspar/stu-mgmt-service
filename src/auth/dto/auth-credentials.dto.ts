import { IsString, MinLength, IsEmail } from "class-validator";

export class AuthCredentialsDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
