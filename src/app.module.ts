import { Module, Provider } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Config } from "./.config/config";
import { typeOrmConfig } from "./.config/typeorm-config";
import { AdmissionStatusModule } from "./admission-status/admission-status.module";
import { AppController } from "./app.controller";
import { AssessmentModule } from "./assessment/assessment.module";
import { AuthModule } from "./auth/auth.module";
import { CourseModule } from "./course/course.module";
import { CsvModule } from "./csv/csv.module";
import { MailingModule } from "./mailing/mailing.module";
import { NotificationModule } from "./notification/notification.module";
import { SubmissionModule } from "./submission/submission.module";
import { TaskSchedulingModule } from "./task-scheduling/task-scheduling.module";
import { UserModule } from "./user/user.module";
import { RequestLogger } from "./utils/request.logger";

const optionalProviders = (): Provider<any>[] => {
	const providers: Provider<any>[] = [];
	if (Config.getLogger().requests) {
		providers.push({ provide: APP_INTERCEPTOR, useClass: RequestLogger });
	}
	return providers;
};

const mailingModule = (): any[] => {
	const modules = [];
	if (Config.getMailing().enabled) {
		modules.push(MailingModule);
	}
	return modules;
};

const taskSchedulingModules = (): any[] => {
	const modules = [];
	if (Config.getMailing().enabled) {
		modules.push(MailingModule);
	}

	if (process.env.NODE_ENV !== "testing") {
		modules.push(ScheduleModule.forRoot(), TaskSchedulingModule);
	}
	return modules;
};

@Module({
	imports: [
		TypeOrmModule.forRoot(typeOrmConfig),
		CourseModule,
		UserModule,
		AuthModule,
		CsvModule,
		AdmissionStatusModule,
		SubmissionModule,
		NotificationModule,
		...mailingModule(),
		//...taskSchedulingModules(),
		AssessmentModule
	],
	controllers: [AppController],
	providers: [...optionalProviders()]
})
export class AppModule {}
