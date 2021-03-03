import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../../../src/user/services/user.service";
import { UserRepository } from "../../../src/user/repositories/user.repository";
import { GroupRepository } from "../../../src/course/repositories/group.repository";
import { AssessmentRepository } from "../../../src/course/repositories/assessment.repository";
import { AssignmentRepository } from "../../../src/course/repositories/assignment.repository";
import { GroupEventRepository } from "../../../src/course/repositories/group-event.repository";
import { convertToEntity } from "../../utils/object-helper";
import { GROUP_EVENT_REJOIN_SCENARIO } from "../../mocks/groups/group-events.mock";
import { GroupEvent } from "../../../src/course/entities/group-event.entity";
import { Assignment } from "../../../src/course/entities/assignment.entity";
import { ASSIGNMENT_JAVA_CLOSED } from "../../mocks/assignments.mock";
import { Group } from "../../../src/course/entities/group.entity";
import { GROUP_1_JAVA } from "../../mocks/groups/groups.mock";
import { USER_STUDENT_JAVA } from "../../mocks/users.mock";
import { COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import { UserLeftGroupEvent } from "../../../src/course/events/group/user-left-group.event";

const mock_UserRepository = () => ({});

const mock_GroupRepository = () => ({
	getGroupById: jest.fn().mockResolvedValue(convertToEntity(Group, GROUP_1_JAVA))
});

const mock_AssessmentRepository = () => ({});

const mock_AssignmentRepository = () => ({
	getAssignmentById: jest
		.fn()
		.mockResolvedValue(convertToEntity(Assignment, ASSIGNMENT_JAVA_CLOSED))
});

const mock_GroupEventRepository = () => ({
	getGroupHistoryOfUser: jest.fn().mockImplementation(() => {
		const eventDtos = GROUP_EVENT_REJOIN_SCENARIO().reverse();
		return eventDtos.map(event => convertToEntity(GroupEvent, event));
	})
});

describe("UserService", () => {
	let service: UserService;
	let userRepository: UserRepository;
	let assignmentRepository: AssignmentRepository;
	let groupEventRepository: GroupEventRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{ provide: UserRepository, useFactory: mock_UserRepository },
				{ provide: GroupRepository, useFactory: mock_GroupRepository },
				{ provide: AssessmentRepository, useFactory: mock_AssessmentRepository },
				{ provide: AssignmentRepository, useFactory: mock_AssignmentRepository },
				{ provide: GroupEventRepository, useFactory: mock_GroupEventRepository }
			]
		}).compile();

		service = module.get(UserService);
		userRepository = module.get(UserRepository);
		assignmentRepository = module.get(AssignmentRepository);
		groupEventRepository = module.get(GroupEventRepository);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("getGroupOfAssignment", () => {
		const user = USER_STUDENT_JAVA;
		const course = COURSE_JAVA_1920;
		const assignment = ASSIGNMENT_JAVA_CLOSED;

		it("User was in group + Assignment had end date -> Returns user's group at end date", async () => {
			const expected = GROUP_1_JAVA;

			const result = await service.getGroupOfAssignment(user.id, course.id, assignment.id);
			expect(result.id).toEqual(expected.id);
		});

		it("User was never in a group -> Returns null", async () => {
			groupEventRepository.getGroupHistoryOfUser = jest.fn().mockResolvedValueOnce([]); // No group history -> User never joined a group
			const result = await service.getGroupOfAssignment(user.id, course.id, assignment.id);
			expect(result).toBeFalsy();
		});

		it("User left group before assignment end -> Returns null", async () => {
			// Last event before assignment is a LEAVE-event
			groupEventRepository.getGroupHistoryOfUser = jest.fn().mockImplementationOnce(() => {
				const lastEventBeforeAssignment = new GroupEvent();
				lastEventBeforeAssignment.event = UserLeftGroupEvent.name;
				lastEventBeforeAssignment.timestamp = new Date(1999, 1, 1);
				console.assert(
					lastEventBeforeAssignment.timestamp.getTime() < assignment.endDate.getTime(),
					"Last event should happen before assignment end"
				);
				return [lastEventBeforeAssignment];
			});

			const result = await service.getGroupOfAssignment(user.id, course.id, assignment.id);
			expect(result).toBeFalsy();
		});

		it("Assignment has no end date -> ", async () => {
			assignmentRepository.getAssignmentById = jest.fn().mockImplementationOnce(() => {
				const assignment = convertToEntity(Assignment, ASSIGNMENT_JAVA_CLOSED);
				assignment.endDate = null;
				return assignment;
			});

			try {
				await service.getGroupOfAssignment(user.id, course.id, assignment.id);
				expect(true).toEqual(false);
			} catch (error) {
				expect(error).toBeTruthy();
			}
		});
	});
});
