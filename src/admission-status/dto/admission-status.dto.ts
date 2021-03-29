import { ParticipantDto } from "../../course/dto/course-participant/participant.dto";
import { RuleCheckResult } from "./rule-check-result.dto";

export class AdmissionStatusDto {
	hasAdmission: boolean;
	hasAdmissionFromPreviousSemester: boolean;
	fulfillsAdmissionCriteria: boolean;
	results: RuleCheckResult[];
	participant: ParticipantDto;
}
