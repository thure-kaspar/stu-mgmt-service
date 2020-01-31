import { Test, TestingModule } from '@nestjs/testing';
import { CourseController } from '../controllers/course.controller';
import { CourseService } from '../services/course.service';
import { GroupService } from '../services/group.service';

const mock_CourseService = () => ({

});

const mock_GroupService = () => ({

});

describe('Course Controller', () => {
	let controller: CourseController;
	let courseService: CourseService;
	let groupService: GroupService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [CourseController],
			providers: [
				{ provide: CourseService, useFactory: mock_CourseService },
				{ provide: GroupService, useFactory: mock_GroupService }
			]
		}).compile();

		controller = module.get<CourseController>(CourseController);
		courseService = module.get<CourseService>(CourseService);
		groupService = module.get<GroupService>(GroupService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
