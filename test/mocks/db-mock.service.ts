import { Connection, EntityManager } from "typeorm";
import { AssessmentAllocation } from "../../src/assessment/entities/assessment-allocation.entity";
import { AssessmentUserRelation } from "../../src/assessment/entities/assessment-user-relation.entity";
import { Assessment } from "../../src/assessment/entities/assessment.entity";
import { PartialAssessment } from "../../src/assessment/entities/partial-assessment.entity";
import { AssignmentDto } from "../../src/course/dto/assignment/assignment.dto";
import { AdmissionCriteria } from "../../src/course/entities/admission-criteria.entity";
import { AssignmentRegistration } from "../../src/course/entities/assignment-group-registration.entity";
import { AssignmentTemplate } from "../../src/course/entities/assignment-template.entity";
import { Assignment, AssignmentId } from "../../src/course/entities/assignment.entity";
import { CourseConfig } from "../../src/course/entities/course-config.entity";
import { Course } from "../../src/course/entities/course.entity";
import { GroupEvent } from "../../src/course/entities/group-event.entity";
import { GroupRegistrationRelation } from "../../src/course/entities/group-registration-relation.entity";
import { GroupSettings } from "../../src/course/entities/group-settings.entity";
import { Group, GroupId } from "../../src/course/entities/group.entity";
import { Participant } from "../../src/course/entities/participant.entity";
import { UserGroupRelation } from "../../src/course/entities/user-group-relation.entity";
import { Subscriber } from "../../src/notification/subscriber/subscriber.entity";
import { User } from "../../src/shared/entities/user.entity";
import { AssignmentState } from "../../src/shared/enums";
import { Submission } from "../../src/submission/submission.entity";
import { convertToEntity, convertToEntityNoRelations } from "../utils/object-helper";
import { ASSESSMENT_ALLOCATIONS_MOCK } from "./assessment-allocation.mock";
import { AssessmentsMock } from "./assessments.mock";
import { ASSIGNMENTS_ALL, ASSIGNMENTS_JAVA_1920 } from "./assignments.mock";
import { ADMISSION_CRITERIA_MOCK } from "./course-config/admission-criteria.mock";
import { ASSIGNMENT_TEMPLATES_MOCK } from "./course-config/assignment-templates.mock";
import { COURSE_CONFIGS_MOCK } from "./course-config/course-config.mock";
import { GROUP_SETTINGS_MOCK } from "./course-config/group-settings.mock";
import { CoursesMock } from "./courses.mock";
import { getGroupEventEntities } from "./groups/group-events.mock";
import { GROUPS_ALL, GROUP_1_JAVA, GROUP_2_JAVA, GROUP_4_JAVA } from "./groups/groups.mock";
import { UserGroupRelationsMock } from "./groups/user-group-relations.mock";
import { PARTIAL_ASSESSMENT_MOCK } from "./partial-assessments.mock";
import {
	COURSE_PARTICIPANTS_ALL,
	PARTICIPANT_JAVA_1920_STUDENT,
	PARTICIPANT_JAVA_1920_STUDENT_2,
	PARTICIPANT_JAVA_1920_STUDENT_ELSHAR,
	PARTICIPANT_JAVA_1920_STUDENT_KUNOLD
} from "./participants/participants.mock";
import { AssessmentUserRelationsMock } from "./relations.mock";
import { SUBMISSION_MOCK } from "./submissions.mock";
import { SUBSCRIBER_MOCK } from "./subscribers.mock";
import { UsersMock } from "./users.mock";

export class DbMockService {
	private con: EntityManager;
	courses = CoursesMock;
	groups = GROUPS_ALL;
	groupEvents = getGroupEventEntities();
	users = UsersMock;
	assignments = ASSIGNMENTS_ALL;
	assessments = AssessmentsMock;
	partialAssessments = PARTIAL_ASSESSMENT_MOCK;
	userGroupRelations = UserGroupRelationsMock;
	assessmentUserRelations = AssessmentUserRelationsMock;
	assignmentTemplates = ASSIGNMENT_TEMPLATES_MOCK;
	groupSettings = GROUP_SETTINGS_MOCK;
	admissionCriteria = ADMISSION_CRITERIA_MOCK;
	configs = COURSE_CONFIGS_MOCK;
	allocations = ASSESSMENT_ALLOCATIONS_MOCK;
	submissions = SUBMISSION_MOCK;
	subscribers = SUBSCRIBER_MOCK;

	constructor(connection: Connection) {
		this.con = connection.manager;
	}

	/**
	 * Fills the database with test data.
	 */
	async createAll(): Promise<void> {
		await this.createCourses();
		await this.createCourseConfig();
		await this.createAssignmentTemplates();
		await this.createAdmissionCriteria();
		await this.createGroupSettings();
		await this.createUsers();
		await this.createGroups();
		await this.createParticipants();
		await this.createUserGroupRelations();
		await this.createGroupEvents();
		await this.createAssignments();
		await this.createAssignmentRegistrations();
		await this.createAssessments();
		await this.createPartialAssessments();
		await this.createAssessmentUserRelations();
		await this.createAssessmentAllocations();
		await this.createSubmissions();
		await this.createSubscribers();
	}

	async createCourses(): Promise<void> {
		const repo = this.con.getRepository(Course);
		const courses = this.courses.map(c => convertToEntityNoRelations(Course, c));

		await repo.insert(courses).catch(error => console.log(error));
	}

	async createCourseConfig(): Promise<void> {
		const repo = this.con.getRepository(CourseConfig);
		const configs: CourseConfig[] = [];

		this.configs.forEach((c, index) => {
			const config = convertToEntityNoRelations(CourseConfig, c);
			config.courseId = this.courses[index].id;
			configs.push(config);
		});

		await repo.insert(configs).catch(error => console.log(error));
	}

	async createGroupSettings(): Promise<void> {
		const repo = this.con.getRepository(GroupSettings);
		const settings = repo.create(this.groupSettings);

		let configId = 1;
		settings.forEach(s => (s.courseConfigId = configId++));

		await repo.insert(settings).catch(error => console.error(error));
	}

	async createAdmissionCriteria(): Promise<void> {
		const repo = this.con.getRepository(AdmissionCriteria);
		const criteria = new AdmissionCriteria();
		criteria.admissionCriteria = this.admissionCriteria;
		criteria.courseConfigId = this.configs[0].id;

		await repo.insert(criteria).catch(error => console.error(error));
	}

	async createAssignmentTemplates(): Promise<void> {
		const repo = this.con.getRepository(AssignmentTemplate);
		const templates = this.assignmentTemplates.map(t => repo.create(t));
		templates.forEach(t => (t.courseConfigId = 1));

		await this.con
			.getRepository(AssignmentTemplate)
			.insert(templates)
			.catch(error => console.error(error));
	}

	async createUsers(): Promise<void> {
		await this.con
			.getRepository(User)
			.insert(this.users)
			.catch(error => console.error(error));
	}

	async createGroups(): Promise<void> {
		// Convert GroupDtos to entities and assign courseId
		const groups: Group[] = [];
		this.groups.forEach(groupsWithCourseId => {
			const _groups = groupsWithCourseId.groups.map(g => convertToEntity(Group, g));
			_groups.forEach(g => (g.courseId = groupsWithCourseId.courseId));
			groups.push(..._groups);
		});

		await this.con
			.getRepository(Group)
			.insert(groups)
			.catch(error => console.error(error));
	}

	async createGroupEvents(): Promise<void> {
		await this.con
			.getRepository(GroupEvent)
			.insert(this.groupEvents)
			.catch(error => console.error(error));
	}

	async createAssignments(): Promise<void> {
		const assignments: Assignment[] = [];
		this.assignments.forEach(assignmentsWithCourseId => {
			const _assignments = assignmentsWithCourseId.assignments.map(a =>
				convertToEntity(Assignment, a)
			);
			_assignments.forEach(a => (a.courseId = assignmentsWithCourseId.courseId));
			assignments.push(..._assignments);
		});

		await this.con
			.getRepository(Assignment)
			.insert(assignments)
			.catch(error => console.error(error));
	}

	async createAssessments(): Promise<void> {
		const assessments = this.assessments.map(a => convertToEntityNoRelations(Assessment, a));
		await this.con
			.getRepository(Assessment)
			.insert(assessments)
			.catch(error => console.error(error));
	}

	async createPartialAssessments(): Promise<void> {
		const repo = this.con.getRepository(PartialAssessment);
		const partials = this.partialAssessments.map(p => repo.create(p));
		await repo.insert(partials).catch(error => console.error(error));
	}

	async createParticipants(): Promise<void> {
		const allParticipants: Partial<Participant>[] = COURSE_PARTICIPANTS_ALL.map(p => {
			return {
				id: p.participant.id,
				courseId: p.courseId,
				userId: p.participant.userId,
				role: p.participant.participant.role
			};
		});

		await this.con
			.getRepository(Participant)
			.insert(allParticipants)
			.catch(error => console.error(error));
	}

	async createAssessmentUserRelations(): Promise<void> {
		await this.con
			.getRepository(AssessmentUserRelation)
			.insert(this.assessmentUserRelations)
			.catch(error => console.error(error));
	}

	async createUserGroupRelations(): Promise<void> {
		await this.con
			.getRepository(UserGroupRelation)
			.insert(this.userGroupRelations)
			.catch(error => console.error(error));
	}

	async createAssessmentAllocations(): Promise<void> {
		const allocations = this.allocations.map(a => convertToEntity(AssessmentAllocation, a));
		await this.con
			.getRepository(AssessmentAllocation)
			.insert(allocations)
			.catch(error => console.error(error));
	}

	async createAssignmentRegistrations(): Promise<void> {
		const repo = this.con.getRepository(AssignmentRegistration);

		const predicate = (a: AssignmentDto): boolean => {
			return (
				a.state === AssignmentState.IN_PROGRESS ||
				a.state === AssignmentState.IN_REVIEW ||
				a.state === AssignmentState.EVALUATED
			);
		};

		const startedAssignments = [
			...ASSIGNMENTS_JAVA_1920.filter(predicate)
			//...ASSIGNMENTS_JAVA_2020.filter(predicate)
		];

		const registrationForGroup = (
			assignmentId: AssignmentId,
			groupId: GroupId,
			participantIds: number[]
		): AssignmentRegistration => {
			return new AssignmentRegistration({
				assignmentId,
				groupId,
				groupRelations: participantIds.map(
					id => new GroupRegistrationRelation({ participantId: id, assignmentId })
				)
			});
		};

		const registrations: AssignmentRegistration[] = [];
		startedAssignments.forEach(assignment => {
			registrations.push(
				registrationForGroup(assignment.id, GROUP_1_JAVA.id, [
					PARTICIPANT_JAVA_1920_STUDENT.id,
					PARTICIPANT_JAVA_1920_STUDENT_2.id
				]),
				registrationForGroup(assignment.id, GROUP_4_JAVA.id, [
					PARTICIPANT_JAVA_1920_STUDENT_ELSHAR.id,
					PARTICIPANT_JAVA_1920_STUDENT_KUNOLD.id
				]),
				registrationForGroup(assignment.id, GROUP_2_JAVA.id, [])
			);
		});

		await repo.save(registrations).catch(error => console.error(error));
	}

	async createSubmissions(): Promise<void> {
		const repo = this.con.getRepository(Submission);

		const submissionEntities = this.submissions.map(s => {
			const entity = new Submission();
			Object.assign(entity, s);
			entity.courseId = "java-wise1920";
			return entity;
		});

		await repo.insert(submissionEntities).catch(error => console.error(error));
	}

	async createSubscribers(): Promise<void> {
		const repo = this.con.getRepository(Subscriber);

		const subscriberEntities = this.subscribers.map(data => {
			const entity = new Subscriber();
			Object.assign(entity, data.dto);
			entity.courseId = data.courseId;
			return entity;
		});

		await repo.insert(subscriberEntities).catch(error => console.error(error));
	}
}
