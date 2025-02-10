import { IsNotEmpty } from "class-validator";

export class AuthSystemCredentials {
	/** The token received from the Authentication System. */
	@IsNotEmpty()
	token: string;
}
