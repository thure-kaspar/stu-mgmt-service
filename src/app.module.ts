import { DynamicModule, ForwardReference, Module, Provider, Type } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
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
import { AuthGuard, KeycloakConnectModule, PolicyEnforcementMode, TokenValidation } from "nest-keycloak-connect";

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
		ExportModule,
		KeycloakConnectModule.register({
			authServerUrl: Config.get().authentication.issuer,
			realm: Config.get().authentication.realm,
			clientId: Config.get().authentication.clientId,
			secret: Config.get().authentication.clientSecret,
			policyEnforcement: PolicyEnforcementMode.PERMISSIVE, 
			tokenValidation: TokenValidation.ONLINE, 
		  })
	];

	if (Config.get().mailing.enabled) {
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
	const providers: Provider<unknown>[] = [
		{
		provide: APP_GUARD,
		useClass: AuthGuard,
	  }];
	if (Config.get().logger.requests) {
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
