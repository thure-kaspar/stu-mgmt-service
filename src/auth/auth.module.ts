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
import { SparkyAuthStrategy } from "./guards/sparky-auth.strategy";
import { TestUserAuthStrategy } from "./guards/test-user-auth.strategy";
import { SparkyService } from "./services/sparky.service";
import { AuthService } from "./services/auth.service";

@Module({
	imports: [TypeOrmModule.forFeature([UserRepository]), HttpModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		SparkyService,
		CacheService,
		RoleGuard,
		SparkyAuthStrategy,
		{
			provide: AuthStrategy,
			useClass: (() =>
				environment.is("development", "demo") ? TestUserAuthStrategy : SparkyAuthStrategy)()
		},
		AuthGuard
	],
	exports: [AuthGuard, AuthStrategy]
})
export class AuthModule {}
