import { Module, HttpModule } from "@nestjs/common";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { RoleGuard } from "./guards/role.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRepository } from "../user/repositories/user.repository";
import { AuthSystemService } from "./services/auth-system.service";
import { CacheService } from "./cache.service";
import { TestUserAuthStrategy } from "./guards/test-user-auth.strategy";
import { SparkyAuthStrategy } from "./guards/sparky-auth.strategy";
import { AuthGuard } from "./guards/auth.guard";
import { AuthStrategy } from "./guards/auth.strategy";

@Module({
	imports: [TypeOrmModule.forFeature([UserRepository]), HttpModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		AuthSystemService,
		CacheService,
		RoleGuard,
		{
			provide: AuthStrategy,
			useClass: (() =>
				process.env.NODE_ENV !== "development"
					? SparkyAuthStrategy
					: TestUserAuthStrategy)()
		},
		AuthGuard
	],
	exports: [AuthGuard, AuthStrategy]
})
export class AuthModule {}
