import { AssessmentService } from "../../../src/course/services/assessment.service";
import { TestingModule, Test } from "@nestjs/testing";
import { AssessmentRepository } from "../../../src/course/database/repositories/assessment.repository";
import { GroupRepository } from "../../../src/course/database/repositories/group.repository";
import { DtoToEntityConverter } from "../../utils/dto-to-entity-converter";
import { GROUP_1_JAVA } from "../../mocks/groups.mock";
import { UserGroupRelation } from "../../../src/shared/entities/user-group-relation.entity";
import { UserGroupRelationsMock } from "../../mocks/relations.mock";
import { DtoFactory } from "../../../src/shared/dto-factory";
import { AssessmentDto } from "../../../src/shared/dto/assessment.dto";
import { ObjectHelper } from "../../utils/object-helper";
import { ASSESSMENT_JAVA_EVALUATED_GROUP_1, ASSESSMENT_JAVA_TESTAT_USER_1, ASSESSMENT_JAVA_EVALUATED_GROUP_2 } from "../../mocks/assessments.mock";
import { Group } from "../../../src/shared/entities/group.entity";

const mock_AssessmentRepository = () => ({
	createAssessment: jest.fn().mockResolvedValue(DtoToEntityConverter.getAssessment(ASSESSMENT_JAVA_EVALUATED_GROUP_1)),
	getAllAssessmentsForAssignment: jest.fn().mockResolvedValue([
		DtoToEntityConverter.getAssessment(ASSESSMENT_JAVA_EVALUATED_GROUP_1),
		DtoToEntityConverter.getAssessment(ASSESSMENT_JAVA_EVALUATED_GROUP_2),
	]),
	getAssessmentById: jest.fn().mockResolvedValue(DtoToEntityConverter.getAssessment(ASSESSMENT_JAVA_EVALUATED_GROUP_1)),
	updateAssessment: jest.fn().mockResolvedValue(DtoToEntityConverter.getAssessment(ASSESSMENT_JAVA_EVALUATED_GROUP_1)),
	deleteAssessment: jest.fn().mockResolvedValue(true),
});

function getGroupMock(): Group {
	// Group with loaded UserGroupRelations
	const group = DtoToEntityConverter.getGroup(GROUP_1_JAVA);
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
	let groupRepository: GroupRepository;
	let assessmentDto: AssessmentDto;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AssessmentService,
				{ provide: AssessmentRepository, useFactory: mock_AssessmentRepository },
				{ provide: GroupRepository, useFactory: mock_GroupRepository }
			],
		}).compile();
		
		DtoFactory.createAssessmentDto = jest.fn();

		service = module.get<AssessmentService>(AssessmentService);
		assessmentRepository = module.get<AssessmentRepository>(AssessmentRepository);
		groupRepository = module.get<GroupRepository>(GroupRepository);
		assessmentDto = ObjectHelper.deepCopy(ASSESSMENT_JAVA_EVALUATED_GROUP_1);
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
			assessmentDto = ObjectHelper.deepCopy(ASSESSMENT_JAVA_TESTAT_USER_1); // Assessment for single user
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
