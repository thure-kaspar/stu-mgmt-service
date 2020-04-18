import { GroupService } from "../../../src/course/services/group.service";
import { CourseRepository } from "../../../src/course/database/repositories/course.repository";
import { DtoFactory } from "../../../src/shared/dto-factory";
import { GroupRepository } from "../../../src/course/database/repositories/group.repository";
import { TestingModule, Test } from "@nestjs/testing";
import { GroupDto } from "../../../src/shared/dto/group.dto";
import { GROUP_1_JAVA, GROUP_2_JAVA } from "../../mocks/groups.mock";
import { copy, convertToEntity } from "../../utils/object-helper";
import { COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import { UserGroupRelation } from "../../../src/shared/entities/user-group-relation.entity";
import { COURSE_CONFIG_JAVA_1920 } from "../../mocks/course-config/course-config.mock";
import { Course } from "../../../src/shared/entities/course.entity";
import { Group } from "../../../src/shared/entities/group.entity";
import { CourseConfig } from "../../../src/course/entities/course-config.entity";

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

const mock_GroupRepository = () => ({
	createGroup: jest.fn().mockResolvedValue(convertToEntity(Group, GROUP_1_JAVA)),
	getGroupWithUsers: jest.fn().mockResolvedValue(getGroupWithUsersMock_JoiningPossible()),
	addUserToGroup: jest.fn(),
	getGroupsOfCourse: jest.fn().mockResolvedValue([
		convertToEntity(Group, GROUP_1_JAVA),
		convertToEntity(Group, GROUP_2_JAVA),
	]),
	updateGroup: jest.fn(),
	deleteGroup: jest.fn(),
});

const mock_CourseRepository = () => ({
	getCourseById: jest.fn().mockResolvedValue(convertToEntity(Course, COURSE_JAVA_1920)),
	getCourseWithConfigAndGroupSettings: jest.fn().mockImplementation(() => { return mock_getCourseWithConfigAndGroupSettings(); })
});

describe("GroupService", () => {

	let service: GroupService;
	let groupRepository: GroupRepository;
	let courseRepository: CourseRepository;
	let groupDto: GroupDto;
	let courseId: string;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GroupService,
				{ provide: GroupRepository, useFactory: mock_GroupRepository },
				{ provide: CourseRepository, useFactory: mock_CourseRepository }
			],
		}).compile();
		
		DtoFactory.createGroupDto = jest.fn();

		service = module.get<GroupService>(GroupService);
		groupRepository = module.get<GroupRepository>(GroupRepository);
		courseRepository = module.get<CourseRepository>(CourseRepository);
		groupDto = copy(GROUP_1_JAVA);
		courseId = copy(GROUP_1_JAVA).courseId;
	});

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("createGroup", () => {
	
		it("Course allows groups -> Calls repository for creation", async () => {
			await service.createGroup(courseId, groupDto);
			expect(groupRepository.createGroup).toHaveBeenCalledWith(groupDto);
		});

		it("Returns Dto", async () => {
			await service.createGroup(courseId, groupDto);
			expect(DtoFactory.createGroupDto).toHaveBeenCalled();
		});

		it("No groups allowed -> Throws Exception", async () => {
			courseRepository.getCourseWithConfigAndGroupSettings = jest.fn().mockImplementationOnce(() => {
				const course = mock_getCourseWithConfigAndGroupSettings();
				course.config.groupSettings.allowGroups = false;
				return course;
			});

			try {
				await service.createGroup(groupDto.courseId, groupDto);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(403);
			}
		});

		it("CourseId differs from Dto -> Throws Exception", async () => {
			courseId = "different_id";

			try {
				await service.createGroup(courseId, groupDto);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
		});
	
	});

	// TODO: Implement mock for new repository method
	describe.skip("addUserToGroup", () => {

		const userId = "user_id";

		it("Joining possible + correct password -> Adds user to group", async () => {
			console.assert(groupDto.password.length > 0, "Group should be password protected");

			await service.addUserToGroup(groupDto.id, userId, groupDto.password);

			expect(groupRepository.getGroupWithUsers).toHaveBeenCalledWith(groupDto.id); // Called to check if joining is possible
			expect(groupRepository.addUserToGroup).toHaveBeenCalledWith(groupDto.id, userId);
		});

		it("Joining possible + No password required -> Adds user to group", async () => {
			groupRepository.getGroupWithUsers = jest.fn().mockResolvedValueOnce(getGroupWithUsersMock_JoiningPossible(false)); // No password required

			await service.addUserToGroup(groupDto.id, userId).catch(error => console.log(error));

			expect(groupRepository.getGroupWithUsers).toHaveBeenCalledWith(groupDto.id); // Called to check if joining is possible
			expect(groupRepository.addUserToGroup).toHaveBeenCalledWith(groupDto.id, userId);
		});
	
		it("Group is closed -> Throws Exception", async () => {
			const groupClosed = copy(GROUP_2_JAVA);
			groupClosed.isClosed = true;
			groupRepository.getGroupWithUsers = jest.fn().mockResolvedValueOnce(convertToEntity(Group, groupClosed));
			
			try {
				await service.addUserToGroup(groupDto.id, userId, groupDto.password);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(409);
			}
		});

		it("Group has reached its max. capacity -> Throws Exception", async () => {
			groupRepository.getGroupWithUsers = jest.fn().mockResolvedValueOnce(getGroupWithUsersMock_CapacityReached());

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
				expect(error.status).toEqual(401);
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
			await service.getGroupsOfCourse(groupDto.courseId);
			expect(groupRepository.getGroupsOfCourse).toHaveBeenCalledWith(groupDto.courseId);
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

	describe("deleteGroup", () => {
	
		it("Calls repository for deletion", async () => {
			await service.deleteGroup(groupDto.id);
			expect(groupRepository.deleteGroup).toHaveBeenCalledWith(groupDto.id);
		});
	
	});

});
