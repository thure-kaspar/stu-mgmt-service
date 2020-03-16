import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { JwtPayload } from "./jwt-payload.interface";
import * as config from "config";

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
	async validate(payload: JwtPayload): Promise<string> {
		// TODO: implement
		return null;
	}
}
