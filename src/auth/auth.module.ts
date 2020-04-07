import { Module, HttpModule } from "@nestjs/common";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt/jwt.strategy";
import * as config from "config";
import { RoleGuard } from "./guards/role.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRepository } from "../user/repositories/user.repository";
import { AuthSystemService } from "./services/auth-system.service";

const jwtConfig = config.get("jwt");

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: "jwt" }),
		JwtModule.register({
			secret: process.env.JWT_SECRET || jwtConfig.secret,
			signOptions: {
				expiresIn: jwtConfig.expiresIn
			}
		}),
		TypeOrmModule.forFeature([UserRepository]),
		HttpModule
	],
	controllers: [AuthController],
	providers: [AuthService, AuthSystemService, JwtStrategy, RoleGuard],
	exports: [JwtStrategy, PassportModule]
})
export class AuthModule { }
