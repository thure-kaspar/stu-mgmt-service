// import { TestingModule, Test } from "@nestjs/testing";
// import { AssignmentService } from "../../../src/course/services/assignment.service";
// import { DtoFactory } from "../../../src/shared/dto-factory";
// import { AssignmentRepository } from "../../../src/course/repositories/assignment.repository";
// import { AssignmentDto } from "../../../src/course/dto/assignment/assignment.dto";
// import { copy, convertToEntity } from "../../utils/object-helper";
// import { ASSIGNMENT_JAVA_EVALUATED, ASSIGNMENT_JAVA_IN_REVIEW_SINGLE } from "../../mocks/assignments.mock";
// import { Assignment } from "../../../src/course/entities/assignment.entity";

// const mock_AssignmentRepository = () => ({
// 	createAssignment: jest.fn().mockResolvedValue(convertToEntity(Assignment, ASSIGNMENT_JAVA_EVALUATED)),
// 	getAssignments: jest.fn().mockResolvedValue([
// 		convertToEntity(Assignment, ASSIGNMENT_JAVA_EVALUATED),
// 		convertToEntity(Assignment, ASSIGNMENT_JAVA_IN_REVIEW_SINGLE)
// 	]),
// 	getAssignmentById: jest.fn().mockResolvedValue(convertToEntity(Assignment, ASSIGNMENT_JAVA_EVALUATED)),
// 	updateAssignment: jest.fn().mockResolvedValue(convertToEntity(Assignment, ASSIGNMENT_JAVA_EVALUATED)),
// 	deleteAssignment: jest.fn().mockResolvedValue(true)
// });

// describe("AssignmentService", () => {

// 	let service: AssignmentService;
// 	let assignmentRepository: AssignmentRepository;
// 	let assignmentDto: AssignmentDto;

// 	beforeEach(async () => {
// 		const module: TestingModule = await Test.createTestingModule({
// 			providers: [
// 				AssignmentService,
// 				{ provide: AssignmentRepository, useFactory: mock_AssignmentRepository }
// 			],
// 		}).compile();

// 		DtoFactory.createAssignmentDto = jest.fn();

// 		service = module.get<AssignmentService>(AssignmentService);
// 		assignmentRepository = module.get<AssignmentRepository>(AssignmentRepository);
// 		assignmentDto = copy(ASSIGNMENT_JAVA_EVALUATED);
// 	});

// 	it("Should be defined", () => {
// 		expect(service).toBeDefined();
// 	});

// 	describe("createAssignment", () => {

// 		it("Calls AssignmentRepository for creation", async () => {
// 			await service.createAssignment(assignmentDto.courseId, assignmentDto);
// 			expect(assignmentRepository.createAssignment).toHaveBeenCalledWith(assignmentDto);
// 		});

// 		it("Returns Dto", async () => {
// 			await service.createAssignment(assignmentDto.courseId, assignmentDto);
// 			expect(DtoFactory.createAssignmentDto).toHaveBeenCalled();
// 		});

// 		it("CourseId of param != CourseId of Dto -> Throws Exception", async () => {
// 			const differentCourseId = "different_id";
// 			try {
// 				await service.createAssignment(differentCourseId, assignmentDto);
// 				expect(true).toEqual(false);
// 			} catch(error) {
// 				expect(error).toBeTruthy();
// 				expect(error.status).toEqual(400);
// 			}
// 		});
// 	});

// 	describe("getAssignments", () => {

// 		it("Calls AssignmentRepository for retrieval", async () => {
// 			await service.getAssignments(assignmentDto.courseId);
// 			expect(assignmentRepository.getAssignments).toHaveBeenCalledWith(assignmentDto.courseId);
// 		});

// 		it("Returns Dtos", async () => {
// 			await service.getAssignments(assignmentDto.courseId);
// 			expect(DtoFactory.createAssignmentDto).toHaveBeenCalled();
// 		});

// 	});

// 	describe("getAssignmentById", () => {

// 		it("Calls AssignmentRepository for retrieval", async () => {
// 			await service.getAssignmentById(assignmentDto.id);
// 			expect(assignmentRepository.getAssignmentById).toHaveBeenCalledWith(assignmentDto.id);
// 		});

// 		it("Returns Dto", async () => {
// 			await service.getAssignmentById(assignmentDto.id);
// 			expect(DtoFactory.createAssignmentDto).toHaveBeenCalled();
// 		});

// 	});

// 	describe("updateAssignment", () => {

// 		it("Calls AssignmentRepository for update", async () => {
// 			await service.updateAssignment(assignmentDto.id, assignmentDto);
// 			expect(assignmentRepository.updateAssignment).toHaveBeenCalledWith(assignmentDto.id, assignmentDto);
// 		});

// 		it("Returns Dto", async () => {
// 			await service.updateAssignment(assignmentDto.id, assignmentDto);
// 			expect(DtoFactory.createAssignmentDto).toHaveBeenCalled();
// 		});

// 		it("Id of param != Id of Dto -> Throws Exception", async () => {
// 			const differentId = "different_Id";
// 			try {
// 				await service.updateAssignment(differentId, assignmentDto);
// 				expect(true).toEqual(false);
// 			} catch(error) {
// 				expect(error).toBeTruthy();
// 				expect(error.status).toEqual(400);
// 			}
// 		});

// 	});

// 	describe("deleteAssignment", () => {

// 		it("Calls AssignmentRepository for deletion", async () => {
// 			await service.deleteAssignment(assignmentDto.id);
// 			expect(assignmentRepository.deleteAssignment).toHaveBeenCalledWith(assignmentDto.id);
// 		});

// 	});

// });
