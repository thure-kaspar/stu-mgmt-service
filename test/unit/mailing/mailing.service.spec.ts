import { MailingService } from "../../../src/mailing/services/mailing.service";
import { NodemailerService } from "../../../src/mailing/services/nodemailer.service";

const mock_NodemailerService = (): Partial<NodemailerService> => ({
	send: jest.fn()
});

describe("MailingService", () => {
	let service: MailingService;
	let nodemailer: NodemailerService;

	beforeEach(async () => {
		nodemailer = mock_NodemailerService() as NodemailerService;
		service = new MailingService(nodemailer);
	});

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});
});
