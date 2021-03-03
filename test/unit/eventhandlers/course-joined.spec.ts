import { TestingModule, Test } from "@nestjs/testing";
import { CourseJoined } from "../../../src/course/events/participant/course-joined.event";
import { CourseWithGroupSettings } from "../../../src/course/models/course-with-group-settings.model";
import { Participant } from "../../../src/course/models/participant.model";
import { GroupService } from "../../../src/course/services/group.service";
import { GroupDto } from "../../../src/course/dto/group/group.dto";
import { convertToEntity, copy } from "../../utils/object-helper";
import { Course } from "../../../src/course/entities/course.entity";
import { Participant as ParticipantEntity } from "../../../src/course/entities/participant.entity";
import { COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import { GroupSettings } from "../../../src/course/entities/group-settings.entity";
import { PARTICIPANT_JAVA_1920_STUDENT_2 } from "../../mocks/participants/participants.mock";
import { USER_STUDENT_JAVA } from "../../mocks/users.mock";
import { User } from "../../../src/shared/entities/user.entity";
import { CourseRole } from "../../../src/shared/enums";
import { CourseJoinedHandler_AutomaticGroupJoin } from "../../../src/course/events/participant/automatic-group-join.handler";

//#region Mocks
// Exact participant does not matter, only needed to fill groups
const defaultGroupMember = PARTICIPANT_JAVA_1920_STUDENT_2.participant;

const groupWithOneMember_NoPassword_Joinable = (): GroupDto => {
	return {
		name: "groupWithOneMember_NoPassword_Joinable",
		id: "groupWithOneMember_NoPassword_Joinable",
		isClosed: false,
		hasPassword: false,
		members: [defaultGroupMember]
	};
};

const groupWithNoMembers_NoPassword_Joinable = (): GroupDto => {
	return {
		name: "groupWithNoMembers_NoPassword_Joinable",
		id: "groupWithNoMembers_NoPassword_Joinable",
		isClosed: false,
		hasPassword: false,
		members: []
	};
};

const groupWithOneMember_WithPassword_NotJoinable = (): GroupDto => {
	return {
		name: "groupWithOneMember_WithPassword_NotJoinable",
		id: "groupWithOneMember_WithPassword_NotJoinable",
		isClosed: false,
		hasPassword: true,
		members: [defaultGroupMember]
	};
};

const groupWithOneMember_IsClosed_NotJoinable = (): GroupDto => {
	return {
		name: "groupWithOneMember_IsClosed_NotJoinable",
		id: "groupWithOneMember_IsClosed_NotJoinable",
		isClosed: true,
		hasPassword: false,
		members: [defaultGroupMember]
	};
};

const groupWithTwoMembers_NoPassword_Joinable = (): GroupDto => {
	return {
		name: "groupWithTwoMembers_NoPassword_Joinable",
		id: "groupWithTwoMembers_NoPassword_Joinable",
		isClosed: false,
		hasPassword: false,
		members: [defaultGroupMember, defaultGroupMember]
	};
};

const groupWithThreeMembers_NoPassword_Full_NotJoinable = (): GroupDto => {
	return {
		name: "groupWithThreeMembers_NoPassword_NotJoinable",
		id: "groupWithThreeMembers_NoPassword_NotJoinable",
		isClosed: false,
		hasPassword: false,
		members: [defaultGroupMember, defaultGroupMember, defaultGroupMember]
	};
};

const mock_GroupService = () => ({
	getGroupsOfCourse: jest.fn(),
	addUserToGroup_Force: jest.fn(),
	createGroup: jest.fn()
});

const createMockCourse = (settings: Partial<GroupSettings>, course?: Partial<Course>) => {
	let _course = convertToEntity(Course, copy(COURSE_JAVA_1920));
	if (course) _course = { ..._course, ...course };
	return new CourseWithGroupSettings(_course, new GroupSettings(settings));
};

//#endregion

describe("CourseJoinedHandler (Automatically adds students to groups)", () => {
	let event: CourseJoined;
	let course: CourseWithGroupSettings;
	let participant: Participant;

	let courseJoinedHandler: CourseJoinedHandler_AutomaticGroupJoin;
	let groupService: GroupService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CourseJoinedHandler_AutomaticGroupJoin,
				{ provide: GroupService, useFactory: mock_GroupService }
			]
		}).compile();

		courseJoinedHandler = module.get(CourseJoinedHandler_AutomaticGroupJoin);
		groupService = module.get(GroupService);

		course = createMockCourse({
			allowGroups: true,
			autoJoinGroupOnCourseJoined: true,
			nameSchema: "JAVA_GROUP",
			sizeMin: 2,
			sizeMax: 3
		});

		participant = new Participant(
			new ParticipantEntity({
				id: 1,
				userId: USER_STUDENT_JAVA.id,
				user: convertToEntity(User, USER_STUDENT_JAVA),
				role: CourseRole.STUDENT
			})
		);

		event = new CourseJoined(course, participant);
	});

	it("Is defined", () => {
		expect(courseJoinedHandler).toBeDefined();
	});

	describe("Groups exist that are below required minimum size", () => {
		const expectedGroupId = groupWithOneMember_NoPassword_Joinable().id;

		beforeEach(() => {
			groupService.getGroupsOfCourse = jest.fn().mockResolvedValueOnce([
				[
					groupWithOneMember_IsClosed_NotJoinable(),
					groupWithOneMember_NoPassword_Joinable(), // <-- Biggest joinable group below sizeMin (2)
					groupWithThreeMembers_NoPassword_Full_NotJoinable(),
					groupWithTwoMembers_NoPassword_Joinable(),
					groupWithNoMembers_NoPassword_Joinable(),
					groupWithOneMember_WithPassword_NotJoinable()
				],
				0
			]);
		});

		it("Adds participant to the biggest of these groups", async () => {
			await courseJoinedHandler.handle(event);
			expect(groupService.addUserToGroup_Force).toHaveBeenCalledWith(
				course.id,
				expectedGroupId,
				participant.userId
			);
		});
	});

	describe("All groups are at minSize or bigger", () => {
		const expectedGroupId = groupWithTwoMembers_NoPassword_Joinable().id;

		beforeEach(() => {
			const groupAtMinSize_Closed_NotJoinable = groupWithTwoMembers_NoPassword_Joinable();
			groupAtMinSize_Closed_NotJoinable.name = "groupAtMinSize_Closed_NotJoinable";
			groupAtMinSize_Closed_NotJoinable.id = "groupAtMinSize_Closed_NotJoinable";
			groupAtMinSize_Closed_NotJoinable.isClosed = true;

			const groupAtMinSize_WithPassword_NotJoinable = groupWithTwoMembers_NoPassword_Joinable();
			groupAtMinSize_WithPassword_NotJoinable.name =
				"groupAtMinSize_WithPassword_NotJoinable";
			groupAtMinSize_WithPassword_NotJoinable.id = "groupAtMinSize_WithPassword_NotJoinable";
			groupAtMinSize_WithPassword_NotJoinable.hasPassword = true;

			groupService.getGroupsOfCourse = jest.fn().mockResolvedValueOnce([
				[
					groupAtMinSize_Closed_NotJoinable,
					groupWithTwoMembers_NoPassword_Joinable(), // <-- Expected
					groupWithThreeMembers_NoPassword_Full_NotJoinable(),
					groupAtMinSize_WithPassword_NotJoinable
				],
				0
			]);
		});

		it("Adds participant to the smallest of these groups", async () => {
			await courseJoinedHandler.handle(event);
			expect(groupService.addUserToGroup_Force).toHaveBeenCalledWith(
				course.id,
				expectedGroupId,
				participant.userId
			);
		});
	});

	describe("No open groups", () => {
		beforeEach(() => {
			groupService.getGroupsOfCourse = jest
				.fn()
				.mockResolvedValueOnce([
					[
						groupWithOneMember_IsClosed_NotJoinable(),
						groupWithThreeMembers_NoPassword_Full_NotJoinable(),
						groupWithOneMember_WithPassword_NotJoinable()
					],
					0
				]);
		});

		it("Creates new group", async () => {
			await courseJoinedHandler.handle(event);
			expect(groupService.createGroup).toHaveBeenCalledWith(
				course,
				participant,
				expect.anything()
			);
		});
	});

	describe("Course disabled automatic group joins", () => {
		it("Nothing happens", async () => {
			const _event: CourseJoined = {
				participant: participant,
				course: createMockCourse({ autoJoinGroupOnCourseJoined: false })
			};
			await courseJoinedHandler.handle(_event);
			expect(groupService.addUserToGroup_Force).toHaveBeenCalledTimes(0);
			expect(groupService.createGroup).toHaveBeenCalledTimes(0);
		});
	});

	describe("Course disabled groups", () => {
		it("Nothing happens", async () => {
			const _event: CourseJoined = {
				participant: participant,
				course: createMockCourse({ allowGroups: false })
			};
			await courseJoinedHandler.handle(_event);
			expect(groupService.addUserToGroup_Force).toHaveBeenCalledTimes(0);
			expect(groupService.createGroup).toHaveBeenCalledTimes(0);
		});
	});
});
