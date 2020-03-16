import { Injectable } from "@nestjs/common";
import { AuthCredentialsDto } from "../dto/auth-credentials.dto";
import { UserDto } from "../../shared/dto/user.dto";
import { UserRepository } from "../../user/repositories/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { DtoFactory } from "../../shared/dto-factory";

@Injectable()
export class AuthSystemService {

	constructor(@InjectRepository(UserRepository) private userRepository: UserRepository) { }

	/**
	 * Send the given credentials to the authentication system.
	 * Returns true, if the credentials were valid.
	 */
	async login(authCredentials: AuthCredentialsDto): Promise<boolean> {
		// TODO: Implement -> Sparkyservice
		return true;
	}

	async getUser(email: string): Promise<UserDto> {
		const user = await this.userRepository.getUserByEmail(email);
		return DtoFactory.createUserDto(user);
	}

}