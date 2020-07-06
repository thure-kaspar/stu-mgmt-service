import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MailTemplateRepository } from "./repositories/mail-template.repository";
import { MailingService } from "./services/mailing.service";
import { NodemailerService } from "./services/nodemailer.service";
import { MailingController } from "./controllers/mailing.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
	controllers: [MailingController],
	imports: [
		TypeOrmModule.forFeature([MailTemplateRepository]),
		AuthModule
	],
	providers: [MailingService, NodemailerService],
	exports: [MailingService]
})
export class MailingModule {}
