import { TestingModule, Test } from "@nestjs/testing";
import { MailingService } from "../../../src/mailing/services/mailing.service";
import { NodemailerService } from "../../../src/mailing/services/nodemailer.service";
import { MailTemplateRepository } from "../../../src/mailing/repositories/mail-template.repository";
import { MailDto } from "../../../src/mailing/dto/mail.dto";
import { MailTemplate } from "../../../src/mailing/entities/mail-template.entity";

function getMockMailTemplate(): MailTemplate {
	const template = new MailTemplate();
	template.id = 1;
	template.key = "EXAMPLE_TEMPLATE";
	template.subject = "Welcome, $$username$$!";
	template.html = "This is a test email for:<br><h2>$$username$$</h2>";
	template.text = "This is a test email for: $$username$$";
	return template;
}

const mock_NodemailerService = () => ({
	send: jest.fn()
});

const mock_MailTemplateRepository = () => ({
	getMailTemplateByKey: jest.fn().mockResolvedValue(getMockMailTemplate())
});

describe("MailingService", () => {

	let service: MailingService;
	let nodemailer: NodemailerService;
	let templateRepo: MailTemplateRepository;
	let mail: MailDto;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MailingService,
				{ provide: NodemailerService, useFactory: mock_NodemailerService },
				{ provide: MailTemplateRepository, useFactory: mock_MailTemplateRepository }
			],
		}).compile();
		
		service = module.get(MailingService);
		nodemailer = module.get(NodemailerService);
		templateRepo = module.get(MailTemplateRepository);

		mail = {
			from: "user@example.com",
			to: "other@user.com",
			subject: "Test email",
			html: "<h2>Test email</h2>",
			text: "Test email"
		};
	});

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("send", () => {
	
		it("Calls Nodemailer to send the email", async () => {
			await service.send(mail);
			expect(nodemailer.send).toHaveBeenCalledWith(expect.anything(), mail); // (settings, mail)
		});
	
	});

	describe("sendFromTemplate", () => {
	
		let placeholders: Map<string, string>;

		beforeEach(() => {
			placeholders = new Map<string, string>();
			placeholders.set("username", "Max Mustermann");
		});

		it("Calls MailTemplateRepository to retrieve the template", async () => {
			const template = getMockMailTemplate();
			await service.sendFromTemplate(mail.to, template.key, placeholders);
			expect(templateRepo.getMailTemplateByKey).toHaveBeenCalledWith(template.key);
		});

		it("Calls send with replaced placeholders", async () => {
			service.send = jest.fn();
			const template = getMockMailTemplate();
			const username = placeholders.get("username");
			const expectedMail: MailDto = {
				from: mail.from,
				to: mail.to,
				subject: `Welcome, ${username}!`,
				html: `This is a test email for:<br><h2>${username}</h2>`,
				text: `This is a test email for: ${username}`
			};

			await service.sendFromTemplate("other@user.com", template.key, placeholders);
			expect(service.send).toHaveBeenCalledWith(expectedMail);
		});

	});

});
