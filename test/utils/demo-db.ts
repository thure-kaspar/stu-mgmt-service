import { Connection, EntityManager, EntityTarget } from "typeorm";
import { AssessmentDto } from "../../src/assessment/dto/assessment.dto";
import { AssessmentUserRelation } from "../../src/assessment/entities/assessment-user-relation.entity";
import { Assessment } from "../../src/assessment/entities/assessment.entity";
import { PartialAssessment } from "../../src/assessment/entities/partial-assessment.entity";
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
import { GroupEvent } from "../../src/course/entities/group-event.entity";
import { GroupRegistrationRelation } from "../../src/course/entities/group-registration-relation.entity";
import { GroupSettings } from "../../src/course/entities/group-settings.entity";
import { Group } from "../../src/course/entities/group.entity";
import { Participant } from "../../src/course/entities/participant.entity";
import { UserGroupRelation } from "../../src/course/entities/user-group-relation.entity";
import { SubscriberDto } from "../../src/notification/subscriber/subscriber.dto";
import { Subscriber } from "../../src/notification/subscriber/subscriber.entity";
import { LinkDto } from "../../src/shared/dto/link.dto";
import { UserDto } from "../../src/shared/dto/user.dto";
import { User } from "../../src/shared/entities/user.entity";
import { CourseRole } from "../../src/shared/enums";
import { Language } from "../../src/shared/language";
import { Submission } from "../../src/submission/submission.entity";
import { UserSettingsDto } from "../../src/user/dto/user-settings.dto";
import { UserSettings } from "../../src/user/entities/user-settings.entity";
import { USER_FROM_AUTH_SYSTEM, USER_STUDENT_JAVA } from "../mocks/users.mock";

/** Omit type with fixed intellisense. */
type Omit_<T, K extends keyof T> = Omit<T, K>;

export type StudentMgmtDbData = {
	courses: CourseSetup[];
	users: UserSetup[];
};

type UserSetup = Omit_<UserDto, "courses"> & {
	settings?: UserSettingsDto;
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

type AssignmentRegistrationSetup = {
	groupName: string;
	/** Group members for this assignment. May differ from `members` defined in `groups`. */
	members: string[];
};

type AssignmentSetup = AssignmentDto & {
	assessments?: AssessmentSetup[];
	/** Defines to which group a participant belongs for this assignment. */
	registrations?: AssignmentRegistrationSetup[];
	submissions?: {
		username: string;
		date: Date;
		group?: string;
		links?: LinkDto[];
		payload?: Record<string, unknown>;
	}[];
};

type GroupSetup = Pick<GroupDto, "id" | "name" | "isClosed" | "password"> & {
	members: string[];
	events?: {
		event: "UserJoinedGroupEvent" | "UserLeftGroupEvent";
		username: string;
		timestamp: Date;
	}[];
};

export type CourseSetup = {
	data: Pick<CourseDto, "id" | "semester" | "shortname" | "title" | "isClosed" | "links">;
	config: {
		password?: string;
		groupSettings: GroupSettingsDto;
		admissionCriteria: AdmissionCriteriaDto;
		subscribers?: SubscriberDto[];
	};
	participants: {
		students?: string[];
		tutors?: string[];
		lecturers: string[];
	};
	groups: GroupSetup[];
	assignments: AssignmentSetup[];
};

export class StudentMgmtDbEntities {
	courses: Course[] = [];
	users: User[] = [];
	groups: Group[] = [];
	groupEvents: GroupEvent[] = [];
	assignments: Assignment[] = [];
	assessments: Assessment[] = [];
	registrations: AssignmentRegistration[] = [];
	subscribers: Subscriber[] = [];
	submissions: Submission[] = [];

	/** Maps usernames to User entities. */
	private usersByName = new Map<string, User>();
	/** Determines the participantId. Should be increased for every participant. */
	private participantIdCounter = 1;
	/** courseId -> Map<username, Participant> */
	private participantsByNameByCourse = new Map<string, Map<string, Participant>>();
	/** courseId -> Map<groupName, Group> */
	private groupsByNameByCourse = new Map<string, Map<string, Group>>();

	constructor(data: StudentMgmtDbData) {
		const { userEntities, usersByName } = this._mapUsers(data.users);
		this.usersByName = usersByName;
		this.users = userEntities;
		this.courses = this._mapCourses(data.courses);
	}

	async populateDatabase(connection: Connection): Promise<void> {
		return connection.transaction(async trx => {
			if (this.users.length > 0) await trx.save(User, this.users);
			if (this.courses.length > 0) await trx.save(Course, this.courses);

			// The following elements can be inserted in parallel (random order)
			let promises: Promise<unknown>[] = [];
			this.addPromise(Group, this.groups, promises, trx);
			this.addPromise(Assignment, this.assignments, promises, trx);
			await Promise.all(promises);

			promises = [];
			this.addPromise(Assessment, this.assessments, promises, trx);
			this.addPromise(AssignmentRegistration, this.registrations, promises, trx);
			this.addPromise(Subscriber, this.subscribers, promises, trx);
			this.addPromise(GroupEvent, this.groupEvents, promises, trx);
			this.addPromise(Submission, this.submissions, promises, trx);
			await Promise.all(promises);
		});
	}

	/** Adds a promise for saving the entities, if `data` is not empty. */
	private addPromise<T>(
		targetOrEntity: EntityTarget<T>,
		data: T[],
		promises: Promise<unknown>[],
		transaction: EntityManager
	): void {
		if (data.length > 0) {
			promises.push(transaction.save(targetOrEntity, data));
		}
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

			this.groupsByNameByCourse.set(courseEntity.id, new Map());
			const groups = this._mapGroups(course.groups, courseEntity.id);
			this.groups.push(...groups);

			const assignments = this._mapAssignments(course.assignments, courseEntity.id);
			this.assignments.push(...assignments);

			if (course.config.subscribers?.length > 0) {
				const subscribers = this._mapSubscribers(
					course.config.subscribers,
					courseEntity.id
				);
				this.subscribers.push(...subscribers);
			}

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

	_mapUsers(users: UserSetup[]): {
		userEntities: StudentMgmtDbEntities["users"];
		usersByName: Map<string, User>;
	} {
		const userEntities: StudentMgmtDbEntities["users"] = [];
		const usersByName = new Map<string, User>();

		for (const user of users) {
			const userEntity = User.fromDto(user);
			const userSettings = new UserSettings();
			userSettings.language = Language.DE;
			userSettings.allowEmails = true;

			if (user.settings) {
				Object.assign(userSettings, user.settings);
			}

			userEntity.settings = userSettings;
			usersByName.set(user.username, userEntity);
			userEntities.push(userEntity);
		}

		return { userEntities, usersByName };
	}

	_mapGroups(groups: GroupSetup[], courseId: string): Group[] {
		return groups.map(g => {
			const group = new Group(g);
			group.courseId = courseId;
			group.isClosed = g.isClosed ?? false;

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
			const groupMap = this.groupsByNameByCourse.get(courseId);
			groupMap.set(group.name, group);

			if (g.events?.length > 0) {
				const groupEvents = this._mapGroupEvents(g.events, group.id);
				this.groupEvents.push(...groupEvents);
			}

			return group;
		});
	}

	_mapGroupEvents(events: GroupSetup["events"], groupId: string): GroupEvent[] {
		return events.map(e => {
			const event = new GroupEvent();
			event.event = e.event;
			event.timestamp = e.timestamp;
			event.groupId = groupId;
			event.userId = this.getUser(e.username).id;
			return event;
		});
	}

	_mapAssignments(assignments: AssignmentSetup[], courseId: string): Assignment[] {
		return assignments.map(a => {
			const assignment = new Assignment();
			Object.assign(assignment, a);

			assignment.courseId = courseId;
			assignment.assessments = [];

			if (a.assessments?.length > 0) {
				const assessments = this._mapAssessments(a.assessments, courseId, a.id);
				this.assessments.push(...assessments);
			}

			if (a.registrations?.length > 0) {
				const registrations = this._mapRegistrations(a.registrations, courseId, a);
				this.registrations.push(...registrations);
			}

			if (a.submissions?.length > 0) {
				const submissions = this._mapSubmissions(a.submissions, courseId, a.id);
				this.submissions.push(...submissions);
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

			if (a.partialAssessments?.length > 0) {
				assessment.partialAssessments = a.partialAssessments.map(p => {
					const partial = new PartialAssessment();
					Object.assign(partial, p);
					return partial;
				});
			}

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
			const members = this.groupsByNameByCourse
				.get(courseId)
				.get(a.target.group).userGroupRelations;

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
			const participant = this.getParticipant(a.target.user, courseId);

			relation.userId = participant.userId;
			relation.assignmentId = assignmentId;
			relation.assessmentId = a.id;
			assessment.assessmentUserRelations = [relation];
		}
	}

	_mapRegistrations(
		registrations: AssignmentRegistrationSetup[],
		courseId: string,
		assignment: AssignmentSetup
	): AssignmentRegistration[] {
		return registrations.map(r => {
			const groups = this.groupsByNameByCourse.get(courseId);

			if (!groups) {
				throw new Error(
					`Cannot create registrations for assignment ${assignment.name}, because course ${courseId} has no groups.`
				);
			}

			const group = groups.get(r.groupName);

			if (!group) {
				throw new Error(`Group "${r.groupName}" does not exist.`);
			}

			const registration = new AssignmentRegistration({
				assignmentId: assignment.id,
				groupId: group.id,
				groupRelations: r.members.map(
					username =>
						new GroupRegistrationRelation({
							assignmentId: assignment.id,
							participantId: this.getParticipant(username, courseId).id,
							participant: this.getParticipant(username, courseId)
						})
				)
			});

			return registration;
		});
	}

	_mapSubmissions(
		submissions: AssignmentSetup["submissions"],
		courseId: string,
		assignmentId: string
	): Submission[] {
		return submissions.map(s => {
			const submission = new Submission();
			submission.courseId = courseId;
			submission.assignmentId = assignmentId;
			submission.userId = this.getUser(s.username).id;
			submission.date = s.date;
			submission.links = s.links;
			submission.payload = s.payload;

			if (s.group) {
				submission.groupId = this.groupsByNameByCourse.get(courseId).get(s.group).id;
			}

			return submission;
		});
	}

	_mapSubscribers(
		subscribers: CourseSetup["config"]["subscribers"],
		courseId: string
	): Subscriber[] {
		return subscribers.map(s => {
			const subscriber = new Subscriber();
			Object.assign(subscriber, s);
			subscriber.courseId = courseId;
			subscriber.updateDate = new Date(2022); // Not nullable in DB, must initialize here
			return subscriber;
		});
	}

	/** Returns the {@link Participant} by username. Throws error, if participant does not exist. */
	private getParticipant(username: string, courseId: string): Participant {
		const participant = this.participantsByNameByCourse.get(courseId).get(username);

		if (!participant) {
			throw new Error(`${username} is not a participant of ${courseId}.`);
		}

		return participant;
	}

	/** Returns the {@link User} by username. Throws error, if user does not exist. */
	private getUser(username: string): User {
		const user = this.usersByName.get(username);

		if (!user) {
			throw new Error(`User ${username} does not exist.`);
		}

		return user;
	}
}
