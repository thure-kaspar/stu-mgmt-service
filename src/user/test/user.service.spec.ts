import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';

const mock_UserRepository = () => ({

});

describe('UserService', () => {
	let service: UserService;
	let userRepository: UserRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{ provide: UserRepository, useFactory: mock_UserRepository }
			],
		}).compile();

		service = module.get<UserService>(UserService);
		userRepository = module.get<UserRepository>(UserRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
