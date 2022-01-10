import { Connection } from "typeorm";
import { AssessmentDto } from "../../src/assessment/dto/assessment.dto";
import { AssessmentUserRelation } from "../../src/assessment/entities/assessment-user-relation.entity";
import { Assessment } from "../../src/assessment/entities/assessment.entity";
import { AssignmentDto } from "../../src/course/dto/assignment/assignment.dto";
import { AdmissionCriteriaDto } from "../../src/course/dto/course-config/admission-criteria.dto";
import { GroupSettingsDto } from "../../src/course/dto/course-config/group-settings.dto";
import { CourseDto } from "../../src/course/dto/course/course.dto";
import { GroupDto } from "../../src/course/dto/group/group.dto";
import { AdmissionCriteria } from "../../src/course/entities/admission-criteria.entity";
import { AssignmentRegistration } from "../../src/course/entities/assignment-group-registration.entity";
import { Assignment } from "../../src/course/entities/assignment.entity";
import { CourseConfig } from "../../src/course/entities/course-config.entity";
import { Course } from "../../src/course/entities/course.entity";
import { GroupSettings } from "../../src/course/entities/group-settings.entity";
import { Group } from "../../src/course/entities/group.entity";
import { Participant } from "../../src/course/entities/participant.entity";
import { UserGroupRelation } from "../../src/course/entities/user-group-relation.entity";
import { UserDto } from "../../src/shared/dto/user.dto";
import { User } from "../../src/shared/entities/user.entity";
import { CourseRole } from "../../src/shared/enums";
import { Language } from "../../src/shared/language";
import { UserSettings } from "../../src/user/entities/user-settings.entity";
import { USER_FROM_AUTH_SYSTEM, USER_STUDENT_JAVA } from "../mocks/users.mock";

/** Omit type with fixed intellisense. */
type Omit_<T, K extends keyof T> = Omit<T, K>;

export type StudentMgmtDbData = {
	courses: CourseSetup[];
	users: Omit_<UserDto, "courses">[];
};

type AssessmentEssentials = Omit_<
	AssessmentDto,
	| "assignment"
	| "assignmentId"
	| "creator"
	| "creatorId"
	| "group"
	| "lastUpdatedBy"
	| "lastUpdatedById"
	| "groupId"
	| "userId"
	| "participant"
>;

type AssessmentSetup = AssessmentEssentials & {
	/** `username` of the creator (i.e. a `LECTURER`). */
	creator: string;
	/** Must contain either name of the targeted group or `username` of a user. */
	target: { group: string; user?: never } | { group?: never; user: string };
};

export type CourseSetup = {
	data: Pick<CourseDto, "id" | "semester" | "shortname" | "title" | "isClosed" | "links">;
	config: {
		password?: string;
		groupSettings: GroupSettingsDto;
		admissionCriteria: AdmissionCriteriaDto;
	};
	participants: {
		students?: string[];
		tutors?: string[];
		lecturers: string[];
	};
	groups: (Pick<GroupDto, "id" | "name" | "isClosed" | "password"> & { members: string[] })[];
	assignments: (AssignmentDto & { assessments?: AssessmentSetup[] })[];
};

export class StudentMgmtDbEntities {
	courses: Course[] = [];
	users: User[] = [];
	groups: Group[] = [];
	assignments: Assignment[] = [];
	assessments: Assessment[] = [];
	registrations: AssignmentRegistration[] = [];

	private usersByName = new Map<string, User>();
	private participantIdCounter = 100; // TODO: Cannot start at 1 due to old data

	/** courseId -> Map<username, Participant> */
	private participantsByNameByCourse = new Map<string, Map<string, Participant>>();
	/** courseId -> Map<groupName, Participant[]> */
	private participantsByGroupByCourse = new Map<string, Map<string, Participant[]>>();

	constructor(data: StudentMgmtDbData) {
		const { userEntities, usersByName } = this._mapUsers(data.users);
		this.usersByName = usersByName;
		// TODO: For now, we will just hardcode some demo users
		this.usersByName.set(USER_STUDENT_JAVA.username, USER_STUDENT_JAVA as any);
		this.usersByName.set(USER_FROM_AUTH_SYSTEM.username, USER_FROM_AUTH_SYSTEM as any);

		this.users = userEntities;
		this.courses = this._mapCourses(data.courses);
	}

	async populateDatabase(connection: Connection): Promise<void> {
		return connection.transaction(async trx => {
			if (this.users.length > 0) await trx.save(User, this.users);
			if (this.courses.length > 0) await trx.save(Course, this.courses);

			// The following elements can be inserted in parallel (random order)
			const promises = [];
			if (this.groups.length > 0) promises.push(trx.save(Group, this.groups));
			if (this.assignments.length > 0) promises.push(trx.save(Assignment, this.assignments));
			await Promise.all(promises);

			const promises2 = [];
			if (this.assessments.length > 0) promises2.push(trx.save(Assessment, this.assessments));
			await Promise.all(promises2);
		});
	}

	_mapCourses(courses: StudentMgmtDbData["courses"]): StudentMgmtDbEntities["courses"] {
		return courses.map(course => {
			const courseEntity = new Course();
			Object.assign(courseEntity, course.data);

			const groupSettings = new GroupSettings(course.config.groupSettings);
			const admissionCriteria = new AdmissionCriteria();
			admissionCriteria.admissionCriteria = course.config.admissionCriteria;

			courseEntity.config = CourseConfig.create({
				courseId: course.data.id,
				password: course.config.password,
				groupSettings,
				admissionCriteria
			});

			// Add participants map for this course, used by other functions to determine participantId
			this.participantsByNameByCourse.set(courseEntity.id, new Map());
			courseEntity.participants = this._mapParticipants(course);

			this.participantsByGroupByCourse.set(courseEntity.id, new Map());
			const groups = this._mapGroups(course.groups, courseEntity.id);
			this.groups.push(...groups);

			const assignments = this._mapAssignments(course.assignments, courseEntity.id);
			this.assignments.push(...assignments);

			return courseEntity;
		});
	}

	_mapParticipants(course: CourseSetup): Participant[] {
		const students =
			course.participants.students?.map(username =>
				this._mapParticipantWithRole(course, username, CourseRole.STUDENT)
			) ?? [];

		const tutors =
			course.participants.tutors?.map(username =>
				this._mapParticipantWithRole(course, username, CourseRole.TUTOR)
			) ?? [];

		const lecturers = course.participants.lecturers?.map(username =>
			this._mapParticipantWithRole(course, username, CourseRole.LECTURER)
		);

		const participants = [...lecturers, ...tutors, ...students];

		return participants;
	}

	private _mapParticipantWithRole(course: CourseSetup, username: string, role: CourseRole) {
		const user = this.usersByName.get(username);

		if (!user) {
			throw new Error(`User "${username}" does not exist.`);
		}

		const participantEntity = new Participant({
			id: this.participantIdCounter++,
			courseId: course.data.id,
			userId: user.id,
			role
		});

		const participantsByName = this.participantsByNameByCourse.get(course.data.id);
		participantsByName.set(username, participantEntity);
		this.participantsByNameByCourse.set(course.data.id, participantsByName);

		return participantEntity;
	}

	_mapUsers(users: StudentMgmtDbData["users"]): {
		userEntities: StudentMgmtDbEntities["users"];
		usersByName: Map<string, User>;
	} {
		const userEntities: StudentMgmtDbEntities["users"] = [];
		const usersByName = new Map<string, User>();

		for (const user of users) {
			const userEntity = new User(user);
			const userSettings = new UserSettings();
			userSettings.language = Language.DE;
			userSettings.allowEmails = true;
			userEntity.settings = userSettings;

			usersByName.set(user.username, userEntity);
			userEntities.push(userEntity);
		}

		return { userEntities, usersByName };
	}

	_mapGroups(groups: StudentMgmtDbData["courses"][0]["groups"], courseId: string): Group[] {
		return groups.map(g => {
			const group = new Group(g);
			group.courseId = courseId;
			group.isClosed = false;

			group.userGroupRelations = g.members.map(username => {
				const courseMap = this.participantsByNameByCourse.get(courseId);
				const participant = courseMap.get(username);

				if (!participant) {
					throw new Error(`Participant "${username}" does not exist in ${courseId}.`);
				}

				const userGroupRelation = new UserGroupRelation({
					participant,
					participantId: participant.id,
					userId: participant.userId,
					groupId: group.id
				});

				return userGroupRelation;
			});

			// Keep track of group members for assessments and registrations
			const groupMap = this.participantsByGroupByCourse.get(courseId);
			groupMap.set(
				group.name,
				group.userGroupRelations.map(rel => rel.participant)
			);

			return group;
		});
	}

	_mapAssignments(
		assignments: StudentMgmtDbData["courses"][0]["assignments"],
		courseId: string
	): Assignment[] {
		return assignments.map(a => {
			const assignment = new Assignment();
			Object.assign(assignment, a);

			assignment.courseId = courseId;
			assignment.assessments = [];

			if (a.assessments) {
				const assessments = this._mapAssessments(a.assessments, courseId, a.id);
				this.assessments.push(...assessments);
			}

			return assignment;
		});
	}

	_mapAssessments(
		assessments: StudentMgmtDbData["courses"][0]["assignments"][0]["assessments"],
		courseId: string,
		assignmentId: string
	): Assessment[] {
		return assessments.map(a => {
			const assessment = new Assessment();
			Object.assign(assessment, a);
			assessment.assignmentId = assignmentId;

			const creator = this.usersByName.get(a.creator);

			if (!creator) {
				throw new Error(`Creator "${a.creator}" of assessment ${a.id} does not exist.`);
			}

			assessment.creatorId = creator.id;

			this._addAssessmentUserRelations(a, courseId, assessment, assignmentId);

			return assessment;
		});
	}

	private _addAssessmentUserRelations(
		a: AssessmentSetup,
		courseId: string,
		assessment: Assessment,
		assignmentId: string
	) {
		if (a.target.group) {
			const members = this.participantsByGroupByCourse.get(courseId).get(a.target.group);

			// Group can be empty
			assessment.assessmentUserRelations = members?.map(m => {
				const relation = new AssessmentUserRelation();
				relation.userId = m.userId;
				relation.assignmentId = assignmentId;
				relation.assessmentId = a.id;
				return relation;
			});
		} else if (a.target.user) {
			const relation = new AssessmentUserRelation();
			const participant = this.participantsByNameByCourse.get(courseId).get(a.target.user);

			if (!participant) {
				throw new Error(`Participant ${a.target.user} does not exist.`);
			}

			relation.userId = participant.userId;
			relation.assignmentId = assignmentId;
			relation.assessmentId = a.id;
			assessment.assessmentUserRelations = [relation];
		}
	}
}
