import { EventBus } from "@nestjs/cqrs";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AssessmentDto, AssessmentUpdateDto } from "../../../src/course/dto/assessment/assessment.dto";
import { PartialAssessmentDto } from "../../../src/course/dto/assessment/partial-assessment.dto";
import { GroupDto } from "../../../src/course/dto/group/group.dto";
import { AssessmentEvent } from "../../../src/course/entities/assessment-event.entity";
import { Assessment } from "../../../src/course/entities/assessment.entity";
import { Assignment } from "../../../src/course/entities/assignment.entity";
import { Group } from "../../../src/course/entities/group.entity";
import { PartialAssessment } from "../../../src/course/entities/partial-assessment.entity";
import { UserGroupRelation } from "../../../src/course/entities/user-group-relation.entity";
import { AssessmentScoreChangedEvent } from "../../../src/course/events/assessment-score-changed.event";
import { AssessmentRepository } from "../../../src/course/repositories/assessment.repository";
import { AssignmentRepository } from "../../../src/course/repositories/assignment.repository";
import { AssessmentService } from "../../../src/course/services/assessment.service";
import { GroupService } from "../../../src/course/services/group.service";
import { DtoFactory } from "../../../src/shared/dto-factory";
import { ASSESSMENT_JAVA_EVALUATED_GROUP_1, ASSESSMENT_JAVA_EVALUATED_GROUP_2, ASSESSMENT_JAVA_IN_REVIEW, ASSESSMENT_JAVA_TESTAT_USER_1 } from "../../mocks/assessments.mock";
import { ASSIGNMENT_JAVA_CLOSED, ASSIGNMENT_JAVA_EVALUATED, ASSIGNMENT_JAVA_IN_REVIEW_SINGLE } from "../../mocks/assignments.mock";
import { GROUP_1_JAVA } from "../../mocks/groups/groups.mock";
import { UserGroupRelationsMock } from "../../mocks/groups/user-group-relations.mock";
import { PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW, PARTIAL_ASSESSMENT_MOCK } from "../../mocks/partial-assessments.mock";
import { PARTICIPANT_JAVA_1920_STUDENT, PARTICIPANT_JAVA_1920_STUDENT_2 } from "../../mocks/participants/participants.mock";
import { convertToEntity, copy } from "../../utils/object-helper";

const mock_AssessmentRepository = () => ({
	createAssessment: jest.fn().mockResolvedValue(convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1)),
	addPartialAssessment: jest.fn().mockResolvedValue(convertToEntity(PartialAssessment, PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW)),
	getAssessmentsForAssignment: jest.fn().mockImplementation(() => {
		const data = [
			convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1),
			convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_2),
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
	updateAssessment: jest.fn().mockResolvedValue(convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1)),
	deleteAssessment: jest.fn().mockResolvedValue(true),
});

const mock_AssignmentRepository = () => ({
	getAssignmentById: jest.fn().mockResolvedValue(convertToEntity(Assignment, ASSIGNMENT_JAVA_IN_REVIEW_SINGLE))
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
	group.users = [
		PARTICIPANT_JAVA_1920_STUDENT,
		PARTICIPANT_JAVA_1920_STUDENT_2
	];
	return group;
}

const mock_Repository = () => ({
	
});

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
			],
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
			const expectedUserIds = getGroupFromAssignmentMock().users.map(u => u.userId);

			await service.createAssessment(assessmentDto.assignmentId, assessmentDto);

			expect(groupService.getGroupFromAssignment).toHaveBeenCalledWith(assessmentDto.groupId, assessmentDto.assignmentId);
			expect(assessmentRepository.createAssessment).toBeCalledWith(assessmentDto, expectedUserIds);
		});

		it("Assessment for user -> Uses userId from Dto", async () => {
			assessmentDto = copy(ASSESSMENT_JAVA_TESTAT_USER_1); // Assessment for single user
			const expectedUserIds = [assessmentDto.userId];

			await service.createAssessment(assessmentDto.assignmentId, assessmentDto);

			expect(assessmentRepository.createAssessment).toBeCalledWith(assessmentDto, expectedUserIds);
		});

		it("AssignmentId from params differs from Dto -> Throws Exception", async () => {
			try {
				await service.createAssessment("wrong_Id", assessmentDto);
				expect(true).toEqual(false);
			} catch(error) {
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
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
		});
	
	});

	describe("addPartialAssessment", () => {
	
		let partialAssessment: PartialAssessmentDto;

		beforeEach(() => {
			partialAssessment = PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW;
		});

		it("Assignment is IN_REVIEW -> Creates partial assessment", async () => {
			const assignmentId = "assignment_id_1";
			const expected = copy(partialAssessment);
			
			const result = await service.addPartialAssessment(assignmentId, partialAssessment.assessmentId, partialAssessment);

			expect(assignmentRepository.getAssignmentById).toHaveBeenCalledWith(assignmentId);
			expect(result).toEqual(expected);
		});

		it("Assignment not IN_REVIEW -> Throws Exception", async () => {
			const assignmentNotInReview = copy(ASSIGNMENT_JAVA_CLOSED);
			assignmentRepository.getAssignmentById = jest.fn().mockResolvedValueOnce(convertToEntity(Assignment, assignmentNotInReview));

			try {
				await service.addPartialAssessment(assignmentNotInReview.id, partialAssessment.assessmentId, partialAssessment);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
		});

		it("Partial assessment refers to different assessment -> Throws exception", async () => {
			const assignmentId = "assignment_id_1";
			const different_assessment_Id = "different_assessment_id";
			console.assert(partialAssessment.assessmentId !== different_assessment_Id);

			try {
				await service.addPartialAssessment(assignmentId, different_assessment_Id, partialAssessment);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
		});
	
	});

	describe("getAssessmentsForAssignment", () => {
		
		it("Returns Dtos and count", async () => {
			const [dtos, count] = await service.getAssessmentsForAssignment(assessmentDto.assignmentId);
			expect(DtoFactory.createAssessmentDto).toHaveBeenCalled();
			expect(dtos).toBeTruthy();
			expect(count).toBeTruthy();
		});

		it("Calls repository for retrieval", async () => {
			const filter = undefined;
			await service.getAssessmentsForAssignment(assessmentDto.assignmentId);
			expect(assessmentRepository.getAssessmentsForAssignment).toHaveBeenCalledWith(assessmentDto.assignmentId, filter);
		});
	
	});

	describe("getAssessmentById", () => {
	
		it("Returns Dto", async () => {
			await service.getAssessmentById(assessmentDto.assignmentId);
			expect(DtoFactory.createAssessmentDto).toHaveBeenCalled();
		});

		it("Calls repository for retrieval", async () => {
			await service.getAssessmentById(assessmentDto.assignmentId);
			expect(assessmentRepository.getAssessmentById).toHaveBeenCalledWith(assessmentDto.assignmentId);
		});
	
	});

	describe("updateAssessment", () => {
		
		const updatedBy = "user_id";
		let validAssessmentForUpdate: AssessmentDto;

		const assessmentBeforeUpdate = () => {
			const assessment = convertToEntity(Assessment, ASSESSMENT_JAVA_IN_REVIEW);
			assessment.assignment = convertToEntity(Assignment, ASSIGNMENT_JAVA_IN_REVIEW_SINGLE);
			assessment.partialAssessments = PARTIAL_ASSESSMENT_MOCK.filter(p => p.assessmentId === assessment.id)
				.map(dto => convertToEntity(PartialAssessment, dto));
			return assessment;
		};

		beforeEach(() => {
			validAssessmentForUpdate = copy(ASSESSMENT_JAVA_IN_REVIEW);
			validAssessmentForUpdate.partialAssessments = PARTIAL_ASSESSMENT_MOCK.filter(p => p.assessmentId === validAssessmentForUpdate.id);
			assessmentRepository.getAssessmentById = jest.fn().mockImplementationOnce(assessmentBeforeUpdate);
		});

		it("Returns Dto", async () => {
			await service.updateAssessment(validAssessmentForUpdate.id, validAssessmentForUpdate, updatedBy);
			expect(DtoFactory.createAssessmentDto).toHaveBeenCalled();
		});

		it("Calls repository to retrieve original assessment", async () => {
			await service.updateAssessment(validAssessmentForUpdate.id, validAssessmentForUpdate, updatedBy);
			expect(assessmentRepository.getAssessmentById).toHaveBeenCalledWith(validAssessmentForUpdate.id);
		});

		it("Assessment state not IN_REVIEW -> Throws exception", async () => {
			assessmentRepository.getAssessmentById = jest.fn().mockImplementationOnce(() => {
				const assessment = convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1);
				assessment.assignment = convertToEntity(Assignment, ASSIGNMENT_JAVA_EVALUATED);
				assessment.partialAssessments = [];
				return assessment;
			});
			try {
				await service.updateAssessment(assessmentDto.id, assessmentDto, updatedBy);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
		});

		it("Assessment state IN_REVIEW -> Calls repository for update", async () => {
			await service.updateAssessment(validAssessmentForUpdate.id, validAssessmentForUpdate, updatedBy);
			expect(assessmentRepository.updateAssessment).toBeCalledWith(validAssessmentForUpdate.id, validAssessmentForUpdate);
		});	

		it("Assessment state IN_REVIEW -> Points changed -> Triggers AssessmentScoreChangedEvent", async () => {
			const newScore = 123;
			const withChangedScore =  assessmentBeforeUpdate();
			withChangedScore.achievedPoints = newScore;
			assessmentRepository.updateAssessment = jest.fn().mockImplementationOnce(() => withChangedScore);

			await service.updateAssessment(withChangedScore.id, withChangedScore, updatedBy);
			expect(events.publish).toHaveBeenCalledWith(new AssessmentScoreChangedEvent(
				validAssessmentForUpdate.id, 
				updatedBy, 
				{ newScore: withChangedScore.achievedPoints, oldScore: assessmentBeforeUpdate().achievedPoints }
			));
		});	

		it("Partial assessment contains incorrect id -> Throws exception", async () => {
			const invalidAssessment = copy(assessmentDto);
			const partial = copy(PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW);
			partial.assessmentId = "some_other_id";

			const invalidUpdate: AssessmentUpdateDto = {
				updatePartialAssignments: [partial]
			};
		
			try {
				await service.updateAssessment(invalidAssessment.id, invalidUpdate, updatedBy);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
		});

		it("Partial included multiple times -> Throws exception", async () => {
			const invalidAssessment = copy(assessmentDto);
			const partial = copy(PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW);
			partial.assessmentId = "some_other_id";

			const invalidUpdate: AssessmentUpdateDto = {
				updatePartialAssignments: [partial],
				removePartialAssignments: [partial]
			};
		
			try {
				await service.updateAssessment(invalidAssessment.id, invalidUpdate, updatedBy);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
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
