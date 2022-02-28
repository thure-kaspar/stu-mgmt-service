import { ParticipantDto } from "../course/dto/course-participant/participant.dto";

export class ActivityDto {
	user: ParticipantDto;
	dates: Date[];
}
