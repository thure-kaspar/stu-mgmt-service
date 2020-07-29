import { GroupService } from "../../../src/course/services/group.service";
import { CourseRepository } from "../../../src/course/repositories/course.repository";
import { DtoFactory } from "../../../src/shared/dto-factory";
import { GroupRepository } from "../../../src/course/repositories/group.repository";
import { TestingModule, Test } from "@nestjs/testing";
import { GroupDto } from "../../../src/course/dto/group/group.dto";
import { GROUP_1_JAVA, GROUP_2_JAVA } from "../../mocks/groups/groups.mock";
import { copy, convertToEntity, convertToEntityNoRelations } from "../../utils/object-helper";
import { COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import { UserGroupRelation } from "../../../src/course/entities/user-group-relation.entity";
import { COURSE_CONFIG_JAVA_1920 } from "../../mocks/course-config/course-config.mock";
import { Course, CourseId } from "../../../src/course/entities/course.entity";
import { Group } from "../../../src/course/entities/group.entity";
import { CourseConfig } from "../../../src/course/entities/course-config.entity";
import { GroupSettings } from "../../../src/course/entities/group-settings.entity";
import { GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF } from "../../mocks/course-config/group-settings.mock";
import { CourseUserRelation } from "../../../src/course/entities/course-user-relation.entity";
import { EventBus } from "@nestjs/cqrs";
import { UserJoinedGroupEvent } from "../../../src/course/events/user-joined-group.event";
import { UserLeftGroupEvent } from "../../../src/course/events/user-left-group.event";
import { GroupEventRepository } from "../../../src/course/repositories/group-event.repository";
import { AssignmentRepository } from "../../../src/course/repositories/assignment.repository";
import { CourseParticipantsService } from "../../../src/course/services/course-participants.service";
import { USER_STUDENT_JAVA, USER_MGMT_ADMIN_JAVA_LECTURER } from "../../mocks/users.mock";
import { CourseRole } from "../../../src/shared/enums";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { User } from "../../../src/shared/entities/user.entity";
import { UserDto } from "../../../src/shared/dto/user.dto";
import { AuthModule } from "../../../src/auth/auth.module";
import { getImports } from "../../mocks/application.mock";
import { GroupFilter } from "../../../src/course/dto/group/group-filter.dto";

function getGroupWithUsersMock_JoiningPossible(passwordRequired = true) {
	const group = convertToEntity(Group, GROUP_1_JAVA);
	const userRelation1 = new UserGroupRelation();
	userRelation1.groupId = group.id;
	userRelation1.userId = "user_id_1";
	group.userGroupRelations = [userRelation1];
	
	const course = convertToEntity(Course, COURSE_JAVA_1920);
	group.course = course;

	if(!passwordRequired) group.password = null;

	return group;
}

function getGroupWithUsersMock_CapacityReached() {
	const group = convertToEntity(Group, GROUP_1_JAVA);
	const course = convertToEntity(Course, COURSE_JAVA_1920);
	group.course = course;

	const userRelation1 = new UserGroupRelation();
	userRelation1.groupId = group.id;
	userRelation1.userId = "user_id_1";
	group.userGroupRelations = [userRelation1];
	
	//group.course.maxGroupSize = 1; // Groups has reached its capacity

	return group;
}

function mock_getCourseWithConfigAndGroupSettings(): Course {
	const course = convertToEntity(Course, COURSE_JAVA_1920);
	const config = convertToEntity(CourseConfig, COURSE_CONFIG_JAVA_1920);
	course.config = config;
	return course;
}

function mock_getGroupForAddUserToGroup(groupClosed: boolean, capacityReached: boolean, password: string): Group {
	const group = convertToEntityNoRelations(Group, GROUP_1_JAVA);
	group.isClosed = groupClosed;
	group.password = password;
	group.userGroupRelations = []; // default: empty group
	group.course = convertToEntityNoRelations(Course, COURSE_JAVA_1920);
	group.course.courseUserRelations = [convertToEntityNoRelations(CourseUserRelation, { courseId: group.courseId, userId: "some_id" })];
	group.course.config = convertToEntityNoRelations(CourseConfig, COURSE_CONFIG_JAVA_1920);
	group.course.config.groupSettings = convertToEntityNoRelations(GroupSettings, GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF);

	if (capacityReached) {
		const capacity = group.course.config.groupSettings.sizeMax;
		for (let index = 0; index < capacity; index++) {
			group.userGroupRelations.push(convertToEntityNoRelations(UserGroupRelation, { groupId: group.id, userId: "user_id" + index }));
		}
	}
	return group;
}

const mock_GroupRepository = () => ({
	createGroup: jest.fn().mockResolvedValue(convertToEntity(Group, GROUP_1_JAVA)),
	getGroupWithUsers: jest.fn().mockResolvedValue(getGroupWithUsersMock_JoiningPossible()),
	addUserToGroup: jest.fn().mockResolvedValue(true),
	getGroupsOfCourse: jest.fn().mockResolvedValue(
		[
			[ // groups
				convertToEntity(Group, GROUP_1_JAVA),
				convertToEntity(Group, GROUP_2_JAVA)
			],
			2 // count
		]
	),
	getGroupForAddUserToGroup: jest.fn().mockResolvedValue(mock_getGroupForAddUserToGroup(false, false, GROUP_1_JAVA.password)),
	updateGroup: jest.fn(),
	removeUser: jest.fn().mockResolvedValue(true),
	deleteGroup: jest.fn(),
});

const mock_CourseRepository = () => ({
	getCourseById: jest.fn().mockResolvedValue(convertToEntity(Course, COURSE_JAVA_1920)),
	getCourseWithConfigAndGroupSettings: jest.fn().mockImplementation(() => { return mock_getCourseWithConfigAndGroupSettings(); })
});

const mock_GroupEventRepository = () => ({
	
});

const mock_AssignmentRepository = () => ({
	
});

const mock_CourseParticipantsService = () => ({
	getParticipant: jest.fn().mockImplementation(() => {
		// Return a student by default
		const user = copy(USER_STUDENT_JAVA);
		user.courseRole = CourseRole.STUDENT;
		return user;
	})
});

const mock_EventBus = () => ({
	publish: jest.fn()
});

describe("GroupService", () => {

	let service: GroupService;
	let groupRepository: GroupRepository;
	let courseRepository: CourseRepository;
	let courseParticipants: CourseParticipantsService;
	let eventBus: EventBus;
	let groupDto: GroupDto;
	let courseId: CourseId;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GroupService,
				{ provide: GroupRepository, useFactory: mock_GroupRepository },
				{ provide: CourseRepository, useFactory: mock_CourseRepository },
				{ provide: GroupEventRepository, useFactory: mock_GroupEventRepository },
				{ provide: AssignmentRepository, useFactory: mock_AssignmentRepository },
				{ provide: CourseParticipantsService, useFactory: mock_CourseParticipantsService },
				{ provide: EventBus, useFactory: mock_EventBus }
			],
		}).compile();
		
		DtoFactory.createGroupDto = jest.fn();

		service = module.get(GroupService);
		groupRepository = module.get(GroupRepository);
		courseRepository = module.get(CourseRepository);
		courseParticipants = module.get(CourseParticipantsService);
		eventBus = module.get(EventBus);
		groupDto = copy(GROUP_1_JAVA);
		courseId = copy(GROUP_1_JAVA).courseId;
	});

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("createGroup", () => {

		let student: UserDto;
		let lecturer: UserDto;

		beforeEach(() => {
			student = copy(USER_STUDENT_JAVA);
			student.courseRole = CourseRole.STUDENT;

			lecturer = copy(USER_MGMT_ADMIN_JAVA_LECTURER);
			lecturer.courseRole = CourseRole.LECTURER;
		});

		it("User is STUDENT + no name schema -> Creates group and adds student", async () => {
			courseRepository.getCourseWithConfigAndGroupSettings = jest.fn().mockImplementationOnce(() => {
				const course = mock_getCourseWithConfigAndGroupSettings();
				course.config.groupSettings.nameSchema = undefined;
				return course;
			});
			service.addUserToGroup_Force = jest.fn().mockImplementationOnce(() => {
				// Do nothing
			});

			await service.createGroup(courseId, groupDto, student);

			expect(service.addUserToGroup_Force).toHaveBeenCalledWith(expect.anything(), student.id);
			expect(DtoFactory.createGroupDto).toHaveBeenCalled();
		});

		// it("User is STUDENT + name schema defined -> Creates group with name schema", async () => {
		// TODO: Unit test creation with name schema
		// });

		it("User is LECTURER -> Creates group", async () => {
			courseParticipants.getParticipant = jest.fn().mockImplementationOnce(()=> {
				const user = copy(USER_MGMT_ADMIN_JAVA_LECTURER);
				user.courseRole = CourseRole.LECTURER;
				return user;
			});

			await service.createGroup(courseId, groupDto, lecturer);

			expect(DtoFactory.createGroupDto).toHaveBeenCalled();
		});

		it("Course is closed -> Throws CourseClosedException", async () => {
			courseRepository.getCourseWithConfigAndGroupSettings = jest.fn().mockImplementationOnce(() => {
				const course = mock_getCourseWithConfigAndGroupSettings();
				course.isClosed = true;
				return course;
			});

			try {
				await service.createGroup(groupDto.courseId, groupDto, lecturer);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(403);
			}
		});

		it("No groups allowed -> Throws GroupsForbiddenException", async () => {
			courseRepository.getCourseWithConfigAndGroupSettings = jest.fn().mockImplementationOnce(() => {
				const course = mock_getCourseWithConfigAndGroupSettings();
				course.config.groupSettings.allowGroups = false;
				return course;
			});

			try {
				await service.createGroup(groupDto.courseId, groupDto, lecturer);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(403);
			}
		});
	
	});

	describe("addUserToGroup", () => {

		const userId = "user_id";

		it("Joining possible + correct password -> Adds user to group", async () => {
			console.assert(groupDto.password.length > 0, "Group should be password protected");

			await service.addUserToGroup(groupDto.id, userId, groupDto.password);

			expect(groupRepository.getGroupForAddUserToGroup).toHaveBeenCalledWith(groupDto.id, userId); // Called to check if joining is possible
			expect(groupRepository.addUserToGroup).toHaveBeenCalledWith(groupDto.id, userId);
		});

		it("Joining possible + No password required -> Adds user to group", async () => {
			groupRepository.getGroupForAddUserToGroup = jest.fn().mockResolvedValueOnce(
				mock_getGroupForAddUserToGroup(false, false, null) // Joining possible, No password required
			);

			await service.addUserToGroup(groupDto.id, userId);

			expect(groupRepository.getGroupForAddUserToGroup).toHaveBeenCalledWith(groupDto.id, userId); // Called to check if joining is possible
			expect(groupRepository.addUserToGroup).toHaveBeenCalledWith(groupDto.id, userId);
		});

		it("Joining possible -> Triggers UserJoinedGroupEvent", async () => {
			console.assert(groupDto.password.length > 0, "Group should be password protected");
			await service.addUserToGroup(groupDto.id, userId, groupDto.password);
			expect(eventBus.publish).toHaveBeenCalledWith(new UserJoinedGroupEvent(groupDto.id, userId));
		});
	
		it("Group is closed -> Throws Exception", async () => {
			groupRepository.getGroupForAddUserToGroup = jest.fn().mockResolvedValueOnce(
				mock_getGroupForAddUserToGroup(true, false, groupDto.password) // Group closed
			);
			
			try {
				await service.addUserToGroup(groupDto.id, userId, groupDto.password);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(409);
			}
		});

		it("Group has reached its max. capacity -> Throws Exception", async () => {
			groupRepository.getGroupForAddUserToGroup = jest.fn().mockResolvedValueOnce(
				mock_getGroupForAddUserToGroup(false, true, groupDto.password) // Group closed
			);

			try {
				await service.addUserToGroup(groupDto.id, userId, groupDto.password);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(409);
			}
		});

		it("Password incorrect -> Throws Exception", async () => {
			const password = "incorrect";
			
			try {
				await service.addUserToGroup(groupDto.id, userId, password);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
		});
	
	});

	describe("addUserToGroup_Force", () => {
	
		const userId = "user_id";

		it("Adds user to group", async () => {
			await service.addUserToGroup_Force(groupDto.id, userId);
			expect(groupRepository.addUserToGroup).toHaveBeenCalledWith(groupDto.id, userId);
		});
	
	});

	describe("getGroupsOfCourse", () => {
	
		it("Calls repository for retrieval", async () => {
			const filter: GroupFilter = {
				name: "group name"
			};
			await service.getGroupsOfCourse(groupDto.courseId, filter);
			expect(groupRepository.getGroupsOfCourse).toHaveBeenCalledWith(groupDto.courseId, filter);
		});

		it("Returns Dtos", async () => {
			await service.getGroupsOfCourse(groupDto.courseId);
			expect(DtoFactory.createGroupDto).toHaveBeenCalled();
		});
	
	});

	describe("getUsersOfGroup", () => {
	
		it("Calls repository for retrieval", async () => {
			DtoFactory.createUserDto = jest.fn();
			await service.getUsersOfGroup(groupDto.id);
			expect(groupRepository.getGroupWithUsers).toHaveBeenCalledWith(groupDto.id);
		});

		it("Returns Dtos", async () => {
			DtoFactory.createUserDto = jest.fn();
			await service.getUsersOfGroup(groupDto.id);
			expect(DtoFactory.createUserDto).toHaveBeenCalled();
		});
	
	});

	describe("updateGroup", () => {
	
		it("Calls repository for update", async () => {
			await service.updateGroup(groupDto.id, groupDto);
			expect(groupRepository.updateGroup).toHaveBeenCalledWith(groupDto.id, groupDto);
		});

		it("Returns Dto", async () => {
			await service.updateGroup(groupDto.id, groupDto);
			expect(DtoFactory.createGroupDto).toHaveBeenCalled();
		});

		it("GroupId differs from Dto", async () => {
			const groupId = "different_id";
			
			try {
				await service.updateGroup(groupId, groupDto);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
			
		});
	
	});

	describe("removeUser", () => {
	
		const userId = "user_id_1";
		const reason = "Reason for leaving the group";

		it("Success -> Removes user from group", async () => {
			await service.removeUser(groupDto.id, userId, reason);
			expect(groupRepository.removeUser).toHaveBeenCalledWith(groupDto.id, userId);
			// No errors thrown
		});

		it("Success -> Triggers UserLeftGroupEvent", async () => {
			await service.removeUser(groupDto.id, userId, reason);
			expect(eventBus.publish).toHaveBeenCalledWith(new UserLeftGroupEvent(groupDto.id, userId, reason));
		});

		it("Removal failed -> Throws Error", async () => {
			groupRepository.removeUser = jest.fn().mockResolvedValueOnce(false);
			try {
				await service.removeUser(groupDto.id, userId, reason);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
			}
		});
	
	});

	describe("deleteGroup", () => {
	
		it("Calls repository for deletion", async () => {
			await service.deleteGroup(groupDto.id);
			expect(groupRepository.deleteGroup).toHaveBeenCalledWith(groupDto.id);
		});
	
	});

});
