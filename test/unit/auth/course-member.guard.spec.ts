import { EntityNotFoundError } from "typeorm";
import { Course, Course as CourseEntity } from "../../../src/course/entities/course.entity";
import { Participant } from "../../../src/course/entities/participant.entity";
import { NotACourseMemberException } from "../../../src/course/exceptions/custom-exceptions";
import {
	checkIsCourseMemberOrAdmin,
	CourseMemberGuardRequest
} from "../../../src/course/guards/course-member/impl";
import { CourseRepository } from "../../../src/course/repositories/course.repository";
import { User } from "../../../src/shared/entities/user.entity";
import { isAdmin, UserRole } from "../../../src/shared/enums";
import { COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import { convertToEntity, copy } from "../../utils/object-helper";

const course = convertToEntity(Course, COURSE_JAVA_1920);
const baseUser = {
	id: "abc",
	username: "mmustermann",
	displayName: "Max Mustermann"
};

const mock_CourseRepository = (): Partial<CourseRepository> => ({
	getCourseById: jest.fn().mockResolvedValue(course),
	getCourseWithParticipant: jest.fn()
});

function createRequest(role: UserRole): CourseMemberGuardRequest {
	const request: CourseMemberGuardRequest = {
		params: {
			courseId: "java-wise1920"
		},
		user: {
			...baseUser,
			role
		}
	};

	return request;
}

describe("checkIsCourseMemberOrAdmin", () => {
	let courseRepository: CourseRepository;

	beforeEach(() => {
		courseRepository = mock_CourseRepository() as CourseRepository;
	});

	describe("Allowed", () => {
		it("Normal user + Course member -> Attaches course and participant to request", async () => {
			const request = createRequest(UserRole.USER);

			const courseWithParticipant = copy(course);
			courseWithParticipant.participants = [
				new Participant({
					userId: request.user.id,
					user: request.user as User
				})
			];

			courseRepository.getCourseWithParticipant = jest
				.fn()
				.mockResolvedValueOnce(courseWithParticipant);

			await checkIsCourseMemberOrAdmin(request, courseRepository);

			expect(courseRepository.getCourseWithParticipant).toHaveBeenCalledWith(
				request.params.courseId,
				request.user.id
			);

			expect(request.participant).toBeDefined();
			expect(request.participant.userId).toEqual(request.user.id);
			expect(request.course).toBeDefined();
			expect(request.course.id).toEqual(request.params.courseId);
		});

		it("Admin + Not a course member -> Attaches course and (faked) participant to request", async () => {
			const request = createRequest(UserRole.SYSTEM_ADMIN);

			await checkIsCourseMemberOrAdmin(request, courseRepository);

			expect(courseRepository.getCourseWithParticipant).not.toHaveBeenCalled();
			expect(courseRepository.getCourseById).toHaveBeenCalledWith(request.params.courseId);

			expect(request.participant).toBeDefined();
			expect(request.participant.userId).toEqual(request.user.id);
			expect(request.course).toBeDefined();
			expect(request.course.id).toEqual(request.params.courseId);
		});
	});

	describe("Disallowed", () => {
		it("Normal user + Not a course member", async () => {
			const request = createRequest(UserRole.USER);

			courseRepository.getCourseWithParticipant = jest.fn().mockImplementation(() => {
				throw new EntityNotFoundError(CourseEntity, {});
			});

			try {
				await checkIsCourseMemberOrAdmin(request, courseRepository);
				expect(true).toEqual(false);
			} catch (error) {
				expect(error).toBeInstanceOf(NotACourseMemberException);
			}

			expect(courseRepository.getCourseWithParticipant).toHaveBeenCalledWith(
				request.params.courseId,
				request.user.id
			);
			expect(courseRepository.getCourseById).not.toHaveBeenCalled();
			expect(request.participant).toBeUndefined();
			expect(request.course).toBeUndefined();
		});
	});
});

describe("isAdmin", () => {
	test.each([
		[UserRole.SYSTEM_ADMIN, true],
		[UserRole.MGMT_ADMIN, true],
		[UserRole.ADMIN_TOOL, true],
		[UserRole.USER, false]
	])("%s -> %s", (role, expected) => {
		expect(isAdmin(role)).toEqual(expected);
	});
});
