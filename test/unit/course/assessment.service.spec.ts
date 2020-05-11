import { AssessmentService } from "../../../src/course/services/assessment.service";
import { TestingModule, Test } from "@nestjs/testing";
import { AssessmentRepository } from "../../../src/course/database/repositories/assessment.repository";
import { GroupRepository } from "../../../src/course/database/repositories/group.repository";
import { GROUP_1_JAVA } from "../../mocks/groups/groups.mock";
import { UserGroupRelation } from "../../../src/course/entities/user-group-relation.entity";
import { UserGroupRelationsMock } from "../../mocks/groups/user-group-relations.mock";
import { DtoFactory } from "../../../src/shared/dto-factory";
import { AssessmentDto } from "../../../src/course/dto/assessment/assessment.dto";
import { copy, convertToEntity } from "../../utils/object-helper";
import { ASSESSMENT_JAVA_EVALUATED_GROUP_1, ASSESSMENT_JAVA_TESTAT_USER_1, ASSESSMENT_JAVA_EVALUATED_GROUP_2 } from "../../mocks/assessments.mock";
import { Group } from "../../../src/course/entities/group.entity";
import { Assessment } from "../../../src/course/entities/assessment.entity";
import { AssignmentRepository } from "../../../src/course/database/repositories/assignment.repository";
import { Assignment } from "../../../src/course/entities/assignment.entity";
import { ASSIGNMENT_JAVA_IN_REVIEW, ASSIGNMENT_JAVA_CLOSED } from "../../mocks/assignments.mock";
import { PartialAssessmentDto } from "../../../src/course/dto/assessment/partial-assessment.dto";
import { PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW } from "../../mocks/partial-assessments.mock";
import { PartialAssessment } from "../../../src/course/entities/partial-assessment.entity";

const mock_AssessmentRepository = () => ({
	createAssessment: jest.fn().mockResolvedValue(convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1)),
	addPartialAssessment: jest.fn().mockResolvedValue(convertToEntity(PartialAssessment, PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW)),
	getAllAssessmentsForAssignment: jest.fn().mockResolvedValue([
		convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1),
		convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_2),
	]),
	getAssessmentById: jest.fn().mockResolvedValue(convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1)),
	updateAssessment: jest.fn().mockResolvedValue(convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1)),
	deleteAssessment: jest.fn().mockResolvedValue(true),
});

const mock_AssignmentRepository = () => ({
	getAssignmentById: jest.fn().mockResolvedValue(convertToEntity(Assignment, ASSIGNMENT_JAVA_IN_REVIEW))
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

const mock_GroupRepository = () => ({
	getGroupWithUsers: jest.fn().mockResolvedValue(getGroupMock())
});

describe("AssessmentService", () => {

	let service: AssessmentService;
	let assessmentRepository: AssessmentRepository;
	let assignmentRepository: AssignmentRepository;
	let groupRepository: GroupRepository;
	let assessmentDto: AssessmentDto;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AssessmentService,
				{ provide: AssessmentRepository, useFactory: mock_AssessmentRepository },
				{ provide: AssignmentRepository, useFactory: mock_AssignmentRepository },
				{ provide: GroupRepository, useFactory: mock_GroupRepository }
			],
		}).compile();
		
		DtoFactory.createAssessmentDto = jest.fn();

		service = module.get<AssessmentService>(AssessmentService);
		assessmentRepository = module.get<AssessmentRepository>(AssessmentRepository);
		assignmentRepository = module.get(AssignmentRepository);
		groupRepository = module.get<GroupRepository>(GroupRepository);
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
			const expectedUserIds = UserGroupRelationsMock.map(x => x.userId);

			await service.createAssessment(assessmentDto.assignmentId, assessmentDto);

			expect(groupRepository.getGroupWithUsers).toHaveBeenCalledWith(assessmentDto.groupId);
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
		
		it("Returns Dtos", async () => {
			await service.getAssessmentsForAssignment(assessmentDto.assignmentId);
			expect(DtoFactory.createAssessmentDto).toHaveBeenCalled();
		});

		it("Calls repository for retrieval", async () => {
			await service.getAssessmentsForAssignment(assessmentDto.assignmentId);
			expect(assessmentRepository.getAllAssessmentsForAssignment).toHaveBeenCalledWith(assessmentDto.assignmentId);
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
	
		it("Returns Dto", async () => {
			await service.updateAssessment(assessmentDto.id, assessmentDto);
			expect(DtoFactory.createAssessmentDto).toHaveBeenCalled();
		});

		it("Calls repository for retrieval", async () => {
			await service.updateAssessment(assessmentDto.id, assessmentDto);
			expect(assessmentRepository.updateAssessment).toHaveBeenCalledWith(assessmentDto.id, assessmentDto);
		});

		it("AssessmentId from params differs from Dto -> Throws Exception", async () => {
			try {
				await service.updateAssessment("wrong_id", assessmentDto);
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
