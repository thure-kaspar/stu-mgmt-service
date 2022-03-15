import { OmitType } from "@nestjs/swagger";
import { AdmissionStatusDto } from "../admission-status/dto/admission-status.dto";
import { GroupDto } from "../course/dto/group/group.dto";
import { AssignmentType } from "../shared/enums";

class RExportAdmissionStatus extends OmitType(AdmissionStatusDto, ["participant"]) {}

class RExportSubmission {
	assignmentId: string;
	date: Date;
}

class RExportGrade {
	assignmentId: string;
	assessmentId: string;
	assignmentType: AssignmentType;
	achievedPointsInPercent: number;
	group?: GroupDto;
}

class RExportUserInfo {
	userId: string;
	username: string;
	displayName: string;
	matrNr: number;
}

export class RExportStudent {
	userInfo: RExportUserInfo;
	activity: Date[];
	submissions: RExportSubmission[];
	admissionStatus: RExportAdmissionStatus;
	grades: RExportGrade[];

	constructor(userInfo: RExportUserInfo) {
		this.userInfo = userInfo;
		this.activity = [];
		this.submissions = [];
		this.admissionStatus = null;
		this.grades = [];
	}
}
