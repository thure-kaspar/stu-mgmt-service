import { AdmissionRule } from "../../../admission-status/rules/abstract-rules";

export class AdmissionCriteriaDto {
	rules: AdmissionRule[];
}
