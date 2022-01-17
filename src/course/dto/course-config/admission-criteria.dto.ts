import { IsArray } from "class-validator";
import { AdmissionRuleDto } from "../../../admission-status/dto/admission-rule.dto";

export class AdmissionCriteriaDto {
	@IsArray()
	rules: AdmissionRuleDto[];
}
