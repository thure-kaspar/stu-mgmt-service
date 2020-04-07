import { IsString, MinLength, IsEmail, IsNotEmpty } from "class-validator";

export class AuthCredentialsDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}

export class AuthSystemCredentials {
	/** The token received from the Authentication System (Sparkyservice). */
	@IsNotEmpty()
	token: string;
}
