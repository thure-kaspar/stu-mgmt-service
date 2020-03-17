import { Module, Provider } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CourseModule } from "./course/course.module";
import { UserModule } from "./user/user.module";
import { TestModule } from "./test/test.module";
import { RequestLogger } from "./utility/request.logger";
import { typeOrmConfig } from "./config/typeorm-config";
import { AuthModule } from "./auth/auth.module";
import * as config from "config";

const optionalProviders = (): Provider<any>[] => {
	const providers: Provider<any>[] = [];
	if (config.get("logger").requests) {
		providers.push({ provide: APP_INTERCEPTOR, useClass: RequestLogger });
	}
	return providers;
};

@Module({
	imports: [
		TypeOrmModule.forRoot(typeOrmConfig),
		CourseModule,
		UserModule,
		TestModule,
		AuthModule
	],
	controllers: [AppController],
	providers: [AppService, ...optionalProviders()],
})
export class AppModule { }
