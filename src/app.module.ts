import { DynamicModule, ForwardReference, Module, Provider, Type } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import typeOrmConfig from "../ormconfig";
import { Config } from "./.config/config";
import { environment } from "./.config/environment";
import { AdmissionStatusModule } from "./admission-status/admission-status.module";
import { AppController } from "./app.controller";
import { AssessmentModule } from "./assessment/assessment.module";
import { AuthModule } from "./auth/auth.module";
import { CourseModule } from "./course/course.module";
import { DemoModule } from "./demo/demo.module";
import { ExportModule } from "./export/export.module";
import { MailingModule } from "./mailing/mailing.module";
import { NotificationModule } from "./notification/notification.module";
import { TaskSchedulingModule } from "./task-scheduling/task-scheduling.module";
import { UserModule } from "./user/user.module";
import { RequestLogger } from "./utils/request.logger";

function Imports(): (
	| Type<unknown>
	| DynamicModule
	| Promise<DynamicModule>
	| ForwardReference<unknown>
)[] {
	const imports = [
		TypeOrmModule.forRoot(typeOrmConfig),
		AuthModule,
		CourseModule,
		UserModule,
		AssessmentModule,
		AdmissionStatusModule,
		NotificationModule,
		ExportModule
	];

	if (Config.getMailing().enabled) {
		imports.push(MailingModule);
	}

	if (environment.is("demo", "production")) {
		imports.push(ScheduleModule.forRoot(), TaskSchedulingModule);
	}

	if (!environment.is("production")) {
		imports.push(DemoModule);
	}

	return imports;
}

function Providers(): Provider<unknown>[] {
	const providers: Provider<unknown>[] = [];
	if (Config.getLogger().requests) {
		providers.push({ provide: APP_INTERCEPTOR, useClass: RequestLogger });
	}
	return providers;
}

@Module({
	imports: Imports(),
	controllers: [AppController],
	providers: Providers()
})
export class AppModule {}
