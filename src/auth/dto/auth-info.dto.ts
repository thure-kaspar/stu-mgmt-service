/** Data received by the external authentication system's /authenticate/check-method. */
export interface AuthInfo {
	user: User;
	token: Token;
}

interface Token {
	token: string;
	expiration: string;
}

interface User {
	username: string;
	fullName: string;
	realm: string;
	passwordDto: PasswordDto;
	settings: Settings;
	role: "DEFAULT" | "ADMIN" | "SERVICE";
}

interface Settings {
	wantsAi: boolean;
	email_receive: boolean;
	email_address: string;
}

interface PasswordDto {
	oldPassword: string;
	newPassword: string;
}
