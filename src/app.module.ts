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
import { UserModule } from "./user/user.module";
import { RequestLogger } from "./utils/request.logger";
import { SubmissionModule } from "./submission/submission.module";
import { ExportModule } from "./export/export.module";
import { NotificationModule } from "./notification/notification.module";
import { AssessmentModule } from "./assessment/assessment.module";

const optionalProviders = (): Provider<any>[] => {
	const providers: Provider<any>[] = [];
	if (config.get("logger").requests) {
		providers.push({ provide: APP_INTERCEPTOR, useClass: RequestLogger });
	}
	return providers;
};

const taskSchedulingModules = (): any[] => {
	const modules = [];
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
		MailingModule,
		CsvModule,
		AdmissionStatusModule,
		SubmissionModule,
		NotificationModule,
		...taskSchedulingModules(),
		AssessmentModule
	],
	controllers: [AppController],
	providers: [...optionalProviders()]
})
export class AppModule {}
