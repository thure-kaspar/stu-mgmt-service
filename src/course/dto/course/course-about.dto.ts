import { ParticipantDto } from "../course-participant/participant.dto";
import { CourseDto } from "./course.dto";

export class CourseAboutDto {
	course: CourseDto;
	participantsCount: number;
	teachingStaff: ParticipantDto[];
}
