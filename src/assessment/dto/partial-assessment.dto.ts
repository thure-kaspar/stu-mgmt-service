import { IsNotEmpty } from "class-validator";
import { MarkerDto } from "./marker.dto";

export class PartialAssessmentDto {
	/**
	 * Unique identifier for this partial assessment.
	 * Must be unique within a single assessment.
	 * If not specified, it will be automatically generated.
	 * @example "task_1"
	 */
	key?: string;
	@IsNotEmpty()
	title: string;
	/** Determines whether the partial assessment should be included, when the assessment is not a draft anymore. */
	draftOnly: boolean;
	comment?: string;
	points?: number;
	markers?: MarkerDto[];
}
