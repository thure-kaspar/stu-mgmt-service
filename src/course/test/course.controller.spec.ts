import { Test, TestingModule } from '@nestjs/testing';
import { CourseController } from '../controllers/course.controller';
import { CourseService } from '../services/course.service';

const mock_CourseService = () => ({

});

describe('Course Controller', () => {
	let controller: CourseController;
	let courseService: CourseService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [CourseController],
			providers: [{ provide: CourseService, useFactory: mock_CourseService }]
		}).compile();

		controller = module.get<CourseController>(CourseController);
		courseService = module.get<CourseService>(CourseService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
