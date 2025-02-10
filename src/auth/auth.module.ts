import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { environment } from "../.config/environment";
import { UserRepository } from "../user/repositories/user.repository";
import { CacheService } from "./cache.service";
import { AuthController } from "./controllers/auth.controller";
import { AuthGuard } from "./guards/auth.guard";
import { AuthStrategy } from "./guards/auth.strategy";
import { RoleGuard } from "./guards/role.guard";
import { TestUserAuthStrategy } from "./guards/test-user-auth.strategy";
import { User } from "src/shared/entities/user.entity";
import { JwtAuthStrategy } from "./guards/jwt-auth.strategy";
import { AuthService } from "./services/auth.service";

@Module({
	imports: [TypeOrmModule.forFeature([UserRepository, User]), HttpModule],
	controllers: [AuthController],
	providers: [
		CacheService,
		UserRepository,
		RoleGuard,
		JwtAuthStrategy,
		AuthService,
		{
			provide: AuthStrategy,
			useClass: (() =>
				environment.is("development", "demo", "testing")
					? TestUserAuthStrategy
					: JwtAuthStrategy)()
		},
		AuthGuard
	],
	exports: [AuthGuard, AuthStrategy]
})
export class AuthModule {}
