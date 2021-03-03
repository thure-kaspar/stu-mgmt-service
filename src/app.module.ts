import { Module, Provider } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as config from "config";
import { typeOrmConfig } from "./.config/typeorm-config";
import { AdmissionStatusModule } from "./admission-status/admission-status.module";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { CourseModule } from "./course/course.module";
import { CsvModule } from "./csv/csv.module";
import { MailingModule } from "./mailing/mailing.module";
import { TaskSchedulingModule } from "./task-scheduling/task-scheduling.module";
import { TestModule } from "./test/test.module";
import { UserModule } from "./user/user.module";
import { RequestLogger } from "./utils/request.logger";

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
		AdmissionStatusModule,
		ScheduleModule.forRoot(),
		TaskSchedulingModule
	],
	controllers: [AppController],
	providers: [...optionalProviders()]
})
export class AppModule {}
