import { Module, Provider } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as config from "config";
import { typeOrmConfig } from "./.config/typeorm-config";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { CourseModule } from "./course/course.module";
import { MailingModule } from "./mailing/mailing.module";
import { TestModule } from "./test/test.module";
import { UserModule } from "./user/user.module";
import { RequestLogger } from "./utils/request.logger";
import { CsvModule } from "./csv/csv.module";
import { AdmissionStatusModule } from "./admission-status/admission-status.module";

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
		AuthModule,
		MailingModule,
		CsvModule,
		AdmissionStatusModule
	],
	controllers: [AppController],
	providers: [...optionalProviders()],
})
export class AppModule { }
