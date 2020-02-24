import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from '../services/course.service';
import { CourseRepository } from '../database/repositories/course.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import { CourseUserRelationRepository } from '../database/repositories/course-user-relation.repository';

const mock_CourseRepository = () => ({

});

const mock_UserRepository = () => ({

});

const mock_CourseUserRepository = () => ({

});

describe('CourseService', () => {
	let service: CourseService;
	let courseRepository: CourseRepository;
	let userRepository: UserRepository;
	let courseUserRepository: CourseUserRelationRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CourseService,
				{ provide: CourseRepository, useFactory: mock_CourseRepository },
				{ provide: UserRepository, useFactory: mock_UserRepository },
				{ provide: CourseUserRelationRepository, useFactory: mock_CourseUserRepository }
			],
		}).compile();

		service = module.get<CourseService>(CourseService);
		courseRepository = module.get<CourseRepository>(CourseRepository);
		userRepository = module.get<UserRepository>(UserRepository);
		courseUserRepository = module.get<CourseUserRelationRepository>(CourseUserRelationRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
