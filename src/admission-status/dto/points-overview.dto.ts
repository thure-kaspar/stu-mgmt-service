import { ParticipantDto } from "../../course/dto/course-participant/participant.dto";
import { AssignmentDto } from "../../course/dto/assignment/assignment.dto";

export class StudentResults {
	student: ParticipantDto;
	achievedPoints: number[];
}

export class PointsOverviewDto {
	assignments: AssignmentDto[];
	results: StudentResults[];
}
