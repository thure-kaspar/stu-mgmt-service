import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../../../src/user/services/user.service";
import { UserRepository } from "../../../src/user/repositories/user.repository";
import { GroupRepository } from "../../../src/course/database/repositories/group.repository";
import { AssessmentRepository } from "../../../src/course/database/repositories/assessment.repository";

const mock_UserRepository = () => ({

});

const mock_GroupRepository = () => ({

});

const mock_AssessmentRepository = () => ({

});

describe("UserService", () => {
	let service: UserService;
	let userRepository: UserRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{ provide: UserRepository, useFactory: mock_UserRepository },
				{ provide: GroupRepository, useFactory: mock_GroupRepository },
				{ provide: AssessmentRepository, useFactory: mock_AssessmentRepository }
			],
		}).compile();

		service = module.get<UserService>(UserService);
		userRepository = module.get<UserRepository>(UserRepository);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
