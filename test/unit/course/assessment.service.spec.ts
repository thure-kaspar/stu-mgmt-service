import { EventBus } from "@nestjs/cqrs";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AssessmentDto, AssessmentUpdateDto } from "../../../src/assessment/dto/assessment.dto";
import { PartialAssessmentDto } from "../../../src/assessment/dto/partial-assessment.dto";
import { AssessmentEvent } from "../../../src/assessment/entities/assessment-event.entity";
import { Assessment } from "../../../src/assessment/entities/assessment.entity";
import { PartialAssessment } from "../../../src/assessment/entities/partial-assessment.entity";
import { AssessmentScoreChanged } from "../../../src/assessment/events/assessment-score-changed.event";
import { AssessmentRepository } from "../../../src/assessment/repositories/assessment.repository";
import { AssessmentService } from "../../../src/assessment/services/assessment.service";
import { GroupDto } from "../../../src/course/dto/group/group.dto";
import { Assignment } from "../../../src/course/entities/assignment.entity";
import { Group } from "../../../src/course/entities/group.entity";
import { UserGroupRelation } from "../../../src/course/entities/user-group-relation.entity";
import { AssignmentRepository } from "../../../src/course/repositories/assignment.repository";
import { GroupService } from "../../../src/course/services/group.service";
import { DtoFactory } from "../../../src/shared/dto-factory";
import {
	ASSESSMENT_JAVA_EVALUATED_GROUP_1,
	ASSESSMENT_JAVA_EVALUATED_GROUP_2,
	ASSESSMENT_JAVA_IN_REVIEW,
	ASSESSMENT_JAVA_TESTAT_USER_1
} from "../../mocks/assessments.mock";
import {
	ASSIGNMENT_JAVA_CLOSED,
	ASSIGNMENT_JAVA_EVALUATED,
	ASSIGNMENT_JAVA_IN_REVIEW_SINGLE
} from "../../mocks/assignments.mock";
import { GROUP_1_JAVA } from "../../mocks/groups/groups.mock";
import { UserGroupRelationsMock } from "../../mocks/groups/user-group-relations.mock";
import {
	PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW,
	PARTIAL_ASSESSMENT_MOCK
} from "../../mocks/partial-assessments.mock";
import {
	PARTICIPANT_JAVA_1920_STUDENT,
	PARTICIPANT_JAVA_1920_STUDENT_2
} from "../../mocks/participants/participants.mock";
import { convertToEntity, copy } from "../../utils/object-helper";

const mock_AssessmentRepository = () => ({
	createAssessment: jest
		.fn()
		.mockResolvedValue(convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1)),
	addPartialAssessment: jest
		.fn()
		.mockResolvedValue(convertToEntity(PartialAssessment, PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW)),
	getAssessmentsForAssignment: jest.fn().mockImplementation(() => {
		const data = [
			convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1),
			convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_2)
		];
		const count = 2;

		return [data, count];
	}),
	getAssessmentById: jest.fn().mockImplementation(() => {
		// Assessment without partial assessments, not in review state
		const assessment = convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1);
		assessment.assignment = convertToEntity(Assignment, ASSIGNMENT_JAVA_EVALUATED);
		assessment.partialAssessments = [];
		return assessment;
	}),
	updateAssessment: jest
		.fn()
		.mockResolvedValue(convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1)),
	deleteAssessment: jest.fn().mockResolvedValue(true)
});

const mock_AssignmentRepository = () => ({
	getAssignmentById: jest
		.fn()
		.mockResolvedValue(convertToEntity(Assignment, ASSIGNMENT_JAVA_IN_REVIEW_SINGLE))
});

function getGroupMock(): Group {
	// Group with loaded UserGroupRelations
	const group = convertToEntity(Group, GROUP_1_JAVA);
	group.userGroupRelations = [];
	UserGroupRelationsMock.forEach(rel => {
		const relation = new UserGroupRelation();
		relation.id = rel.id;
		relation.groupId = rel.groupId;
		relation.userId = rel.userId;
		group.userGroupRelations.push(relation);
	});
	return group;
}

function getGroupFromAssignmentMock(): GroupDto {
	const group = copy(GROUP_1_JAVA);
	group.members = [
		PARTICIPANT_JAVA_1920_STUDENT.participant,
		PARTICIPANT_JAVA_1920_STUDENT_2.participant
	];
	return group;
}

const mock_Repository = () => ({});

const mock_GroupService = () => ({
	getGroupFromAssignment: jest.fn().mockResolvedValue(getGroupFromAssignmentMock())
});

const mock_EventBus = () => ({
	publish: jest.fn()
});

describe("AssessmentService", () => {
	let service: AssessmentService;
	let assessmentRepository: AssessmentRepository;
	let assignmentRepository: AssignmentRepository;
	let groupService: GroupService;
	let events: EventBus;

	let assessmentDto: AssessmentDto;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AssessmentService,
				{ provide: AssessmentRepository, useFactory: mock_AssessmentRepository },
				{ provide: AssignmentRepository, useFactory: mock_AssignmentRepository },
				{ provide: getRepositoryToken(AssessmentEvent), useFactory: mock_Repository },
				{ provide: GroupService, useFactory: mock_GroupService },
				{ provide: EventBus, useFactory: mock_EventBus }
			]
		}).compile();

		DtoFactory.createAssessmentDto = jest.fn();

		service = module.get<AssessmentService>(AssessmentService);
		assessmentRepository = module.get<AssessmentRepository>(AssessmentRepository);
		assignmentRepository = module.get(AssignmentRepository);
		groupService = module.get(GroupService);
		events = module.get(EventBus);
		assessmentDto = copy(ASSESSMENT_JAVA_EVALUATED_GROUP_1);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("createAssessment", () => {
		it("Returns Dto", async () => {
			await service.createAssessment(assessmentDto.assignmentId, assessmentDto);
			expect(DtoFactory.createAssessmentDto).toHaveBeenCalled();
		});

		it("Assessment for group -> Loads group members and extracts userIds", async () => {
			const expectedUserIds = getGroupFromAssignmentMock().members.map(u => u.userId);

			await service.createAssessment(assessmentDto.assignmentId, assessmentDto);

			expect(groupService.getGroupFromAssignment).toHaveBeenCalledWith(
				assessmentDto.groupId,
				assessmentDto.assignmentId
			);
			expect(assessmentRepository.createAssessment).toBeCalledWith(
				assessmentDto,
				expectedUserIds
			);
		});

		it("Assessment for user -> Uses userId from Dto", async () => {
			assessmentDto = copy(ASSESSMENT_JAVA_TESTAT_USER_1); // Assessment for single user
			const expectedUserIds = [assessmentDto.userId];

			await service.createAssessment(assessmentDto.assignmentId, assessmentDto);

			expect(assessmentRepository.createAssessment).toBeCalledWith(
				assessmentDto,
				expectedUserIds
			);
		});

		it("AssignmentId from params differs from Dto -> Throws Exception", async () => {
			try {
				await service.createAssessment("wrong_Id", assessmentDto);
				expect(true).toEqual(false);
			} catch (error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
		});

		it("No groupId or userId specified -> Throws Exception", async () => {
			assessmentDto.groupId = undefined;
			assessmentDto.userId = undefined;

			try {
				await service.createAssessment(assessmentDto.assignmentId, assessmentDto);
				expect(true).toEqual(false);
			} catch (error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
		});
	});

	describe("getAssessmentsForAssignment", () => {
		it("Returns Dtos and count", async () => {
			const [dtos, count] = await service.getAssessmentsForAssignment(
				assessmentDto.assignmentId
			);
			expect(DtoFactory.createAssessmentDto).toHaveBeenCalled();
			expect(dtos).toBeTruthy();
			expect(count).toBeTruthy();
		});

		it("Calls repository for retrieval", async () => {
			const filter = undefined;
			await service.getAssessmentsForAssignment(assessmentDto.assignmentId);
			expect(assessmentRepository.getAssessmentsForAssignment).toHaveBeenCalledWith(
				assessmentDto.assignmentId,
				filter
			);
		});
	});

	describe("getAssessmentById", () => {
		it("Returns Dto", async () => {
			await service.getAssessmentById(assessmentDto.assignmentId);
			expect(DtoFactory.createAssessmentDto).toHaveBeenCalled();
		});

		it("Calls repository for retrieval", async () => {
			await service.getAssessmentById(assessmentDto.assignmentId);
			expect(assessmentRepository.getAssessmentById).toHaveBeenCalledWith(
				assessmentDto.assignmentId
			);
		});
	});

	describe("updateAssessment", () => {
		const updatedBy = "user_id";
		let validAssessmentForUpdate: AssessmentDto;

		const assessmentBeforeUpdate = () => {
			const assessment = convertToEntity(Assessment, ASSESSMENT_JAVA_IN_REVIEW);
			assessment.assignment = convertToEntity(Assignment, ASSIGNMENT_JAVA_IN_REVIEW_SINGLE);
			assessment.partialAssessments = [];
			return assessment;
		};

		beforeEach(() => {
			validAssessmentForUpdate = copy(ASSESSMENT_JAVA_IN_REVIEW);
			validAssessmentForUpdate.partialAssessments = [];
			assessmentRepository.getAssessmentById = jest
				.fn()
				.mockImplementationOnce(assessmentBeforeUpdate);
		});

		it("Returns Dto", async () => {
			await service.updateAssessment(
				validAssessmentForUpdate.id,
				validAssessmentForUpdate,
				updatedBy
			);
			expect(DtoFactory.createAssessmentDto).toHaveBeenCalled();
		});

		it("Calls repository to retrieve original assessment", async () => {
			await service.updateAssessment(
				validAssessmentForUpdate.id,
				validAssessmentForUpdate,
				updatedBy
			);
			expect(assessmentRepository.getAssessmentById).toHaveBeenCalledWith(
				validAssessmentForUpdate.id
			);
		});

		it("Calls repository for update", async () => {
			await service.updateAssessment(
				validAssessmentForUpdate.id,
				validAssessmentForUpdate,
				updatedBy
			);
			expect(assessmentRepository.updateAssessment).toBeCalledWith(
				validAssessmentForUpdate.id,
				validAssessmentForUpdate
			);
		});

		it("Assessment state IN_REVIEW -> Points changed -> Triggers AssessmentScoreChangedEvent", async () => {
			const newScore = 123;
			const withChangedScore = assessmentBeforeUpdate();
			withChangedScore.achievedPoints = newScore;
			assessmentRepository.updateAssessment = jest
				.fn()
				.mockImplementationOnce(() => withChangedScore);

			await service.updateAssessment(withChangedScore.id, withChangedScore, updatedBy);
			expect(events.publish).toHaveBeenCalledWith(
				new AssessmentScoreChanged(validAssessmentForUpdate.id, updatedBy, {
					newScore: withChangedScore.achievedPoints,
					oldScore: assessmentBeforeUpdate().achievedPoints
				})
			);
		});
	});

	describe("deleteAssessment", () => {
		it("Calls repository for deletion", async () => {
			await service.deleteAssessment(assessmentDto.id);
			expect(assessmentRepository.deleteAssessment).toHaveBeenCalledWith(assessmentDto.id);
		});

		it("If deletion successful -> Returns true", async () => {
			const result = await service.deleteAssessment(assessmentDto.id);
			expect(result).toEqual(true);
		});
	});
});
