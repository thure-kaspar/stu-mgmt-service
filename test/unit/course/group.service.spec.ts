import { EventBus } from "@nestjs/cqrs";
import { Test, TestingModule } from "@nestjs/testing";
import { ParticipantDto } from "../../../src/course/dto/course-participant/participant.dto";
import { GroupFilter } from "../../../src/course/dto/group/group-filter.dto";
import { GroupDto } from "../../../src/course/dto/group/group.dto";
import { CourseConfig } from "../../../src/course/entities/course-config.entity";
import { Course, CourseId } from "../../../src/course/entities/course.entity";
import { GroupSettings } from "../../../src/course/entities/group-settings.entity";
import { Group } from "../../../src/course/entities/group.entity";
import { Participant } from "../../../src/course/entities/participant.entity";
import { UserGroupRelation } from "../../../src/course/entities/user-group-relation.entity";
import { UserJoinedGroupEvent } from "../../../src/course/events/user-joined-group.event";
import { UserLeftGroupEvent } from "../../../src/course/events/user-left-group.event";
import { AssignmentRepository } from "../../../src/course/repositories/assignment.repository";
import { CourseRepository } from "../../../src/course/repositories/course.repository";
import { GroupEventRepository } from "../../../src/course/repositories/group-event.repository";
import { GroupRepository } from "../../../src/course/repositories/group.repository";
import { CourseParticipantsService } from "../../../src/course/services/course-participants.service";
import { GroupService } from "../../../src/course/services/group.service";
import { DtoFactory } from "../../../src/shared/dto-factory";
import { COURSE_CONFIG_JAVA_1920 } from "../../mocks/course-config/course-config.mock";
import { GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF } from "../../mocks/course-config/group-settings.mock";
import { COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import { GROUP_1_JAVA, GROUP_2_JAVA } from "../../mocks/groups/groups.mock";
import { PARTICIPANT_JAVA_1920_LECTURER, PARTICIPANT_JAVA_1920_STUDENT } from "../../mocks/participants/participants.mock";
import { convertToEntity, convertToEntityNoRelations, copy } from "../../utils/object-helper";
import { AlreadyInGroupException } from "../../../src/course/exceptions/custom-exceptions";

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
	group.course.participants = [convertToEntityNoRelations(Participant, { courseId: group.courseId, userId: "some_id" })];
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

const mock_EventBus = () => ({
	publish: jest.fn()
});

describe("GroupService", () => {

	let service: GroupService;
	let groupRepository: GroupRepository;
	let courseRepository: CourseRepository;
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
				{ provide: EventBus, useFactory: mock_EventBus }
			],
		}).compile();
		
		DtoFactory.createGroupDto = jest.fn();

		service = module.get(GroupService);
		groupRepository = module.get(GroupRepository);
		courseRepository = module.get(CourseRepository);
		eventBus = module.get(EventBus);
		groupDto = copy(GROUP_1_JAVA);
		courseId = copy(GROUP_1_JAVA).courseId;
	});

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("createGroup", () => {

		let student: ParticipantDto;
		let lecturer: ParticipantDto;

		beforeEach(() => {
			student = copy(PARTICIPANT_JAVA_1920_STUDENT);
			student.group = undefined;
			student.groupId = undefined;
			lecturer = copy(PARTICIPANT_JAVA_1920_LECTURER);
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

			expect(service.addUserToGroup_Force).toHaveBeenCalledWith(courseId, groupDto.id, student.userId);
			expect(DtoFactory.createGroupDto).toHaveBeenCalled();
		});

		// it("User is STUDENT + name schema defined -> Creates group with name schema", async () => {
		// TODO: Unit test creation with name schema
		// });

		it("User is LECTURER -> Creates group", async () => {
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

		it("User already has a group -> Throws AlreadyInGroupException", async () => {
			const studentWithGroup = copy(PARTICIPANT_JAVA_1920_STUDENT);
			studentWithGroup.groupId = GROUP_1_JAVA.id;
			studentWithGroup.group = GROUP_1_JAVA;
			
			try {
				await service.createGroup(groupDto.courseId, groupDto, studentWithGroup);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(409);
				expect(error).toBeInstanceOf(AlreadyInGroupException);
			}
		});
	
	});

	describe("addUserToGroup", () => {

		const userId = "user_id";
		const courseId = "course_id";

		it("Joining possible + correct password -> Adds user to group", async () => {
			console.assert(groupDto.password.length > 0, "Group should be password protected");

			await service.addUserToGroup(courseId, groupDto.id, userId, groupDto.password);

			expect(groupRepository.getGroupForAddUserToGroup).toHaveBeenCalledWith(groupDto.id, userId); // Called to check if joining is possible
			expect(groupRepository.addUserToGroup).toHaveBeenCalledWith(courseId, groupDto.id, userId);
		});

		it("Joining possible + No password required -> Adds user to group", async () => {
			groupRepository.getGroupForAddUserToGroup = jest.fn().mockResolvedValueOnce(
				mock_getGroupForAddUserToGroup(false, false, null) // Joining possible, No password required
			);

			await service.addUserToGroup(courseId, groupDto.id, userId);

			expect(groupRepository.getGroupForAddUserToGroup).toHaveBeenCalledWith(groupDto.id, userId); // Called to check if joining is possible
			expect(groupRepository.addUserToGroup).toHaveBeenCalledWith(courseId, groupDto.id, userId);
		});

		it("Joining possible -> Triggers UserJoinedGroupEvent", async () => {
			console.assert(groupDto.password.length > 0, "Group should be password protected");
			await service.addUserToGroup(courseId, groupDto.id, userId, groupDto.password);
			expect(eventBus.publish).toHaveBeenCalledWith(new UserJoinedGroupEvent(groupDto.id, userId));
		});
	
		it("Group is closed -> Throws Exception", async () => {
			groupRepository.getGroupForAddUserToGroup = jest.fn().mockResolvedValueOnce(
				mock_getGroupForAddUserToGroup(true, false, groupDto.password) // Group closed
			);
			
			try {
				await service.addUserToGroup(courseId, groupDto.id, userId, groupDto.password);
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
				await service.addUserToGroup(courseId, groupDto.id, userId, groupDto.password);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(409);
			}
		});

		it("Password incorrect -> Throws Exception", async () => {
			const password = "incorrect";
			
			try {
				await service.addUserToGroup(courseId, groupDto.id, userId, password);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
		});
	
	});

	describe("addUserToGroup_Force", () => {
	
		const userId = "user_id";
		const courseId = "course_id";

		it("Adds user to group", async () => {
			await service.addUserToGroup_Force(courseId, groupDto.id, userId);
			expect(groupRepository.addUserToGroup).toHaveBeenCalledWith(courseId, groupDto.id, userId);
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
