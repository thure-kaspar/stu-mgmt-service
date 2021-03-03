import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { JwtPayload } from "./jwt-payload.interface";
import * as config from "config";
import { UserDto } from "../../shared/dto/user.dto";
import { UnauthorizedException } from "@nestjs/common";

export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET || config.get("jwt.secret")
		});
	}

	/**
	 * Validates the received authentication token (JWT) and attaches the decrypted user information
	 * to the request body.
	 */
	async validate(payload: JwtPayload): Promise<Partial<UserDto>> {
		const { userId, username, role } = payload;

		if (!username) {
			throw new UnauthorizedException();
		}

		return { id: userId, username, role };
	}
}
