import {EntityRepository, Repository} from "typeorm";
import { MailTemplate } from "../entities/mail-template.entity";

@EntityRepository(MailTemplate)
export class MailTemplateRepository extends Repository<MailTemplate> {

	async getMailTemplateByKey(mailTemplateKey: string): Promise<MailTemplate> {
		return this.findOne({ key: mailTemplateKey });
	}
}
