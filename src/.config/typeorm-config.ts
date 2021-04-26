import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as config from "config";
import { AssessmentAllocation } from "../assessment/entities/assessment-allocation.entity";
import { AssessmentEvent } from "../assessment/entities/assessment-event.entity";
import { AssessmentUserRelation } from "../assessment/entities/assessment-user-relation.entity";
import { Assessment } from "../assessment/entities/assessment.entity";
import { PartialAssessment } from "../assessment/entities/partial-assessment.entity";
import { AdmissionCriteria } from "../course/entities/admission-criteria.entity";
import { AdmissionFromPreviousSemester } from "../course/entities/admission-from-previous-semester.entity";
import { AssignmentRegistration } from "../course/entities/assignment-group-registration.entity";
import { AssignmentTemplate } from "../course/entities/assignment-template.entity";
import { Assignment } from "../course/entities/assignment.entity";
import { CourseConfig } from "../course/entities/course-config.entity";
import { Course } from "../course/entities/course.entity";
import { GroupEvent } from "../course/entities/group-event.entity";
import { GroupRegistrationRelation } from "../course/entities/group-registration-relation.entity";
import { GroupSettings } from "../course/entities/group-settings.entity";
import { Group } from "../course/entities/group.entity";
import { Participant } from "../course/entities/participant.entity";
import { UserGroupRelation } from "../course/entities/user-group-relation.entity";
import { MailTemplate } from "../mailing/entities/mail-template.entity";
import { Subscriber } from "../notification/subscriber/subscriber.entity";
import { User } from "../shared/entities/user.entity";
import { Submission } from "../submission/submission.entity";

const dbConfig = config.get("db");
const loggingConfig = config.get("logger");

export const typeOrmConfig: TypeOrmModuleOptions = {
	type: process.env.DB_TYPE || dbConfig.type,
	host: process.env.DB_HOST || dbConfig.host,
	port: process.env.DB_PORT || dbConfig.port,
	username: process.env.DB_USERNAME || dbConfig.username,
	password: process.env.DB_PASSWORD || dbConfig.password,
	database: process.env.DB_DATABASE || dbConfig.database,
	synchronize: process.env.TYPEORM_SYNC || dbConfig.synchronize,
	dropSchema: dbConfig.dropSchema || false,
	keepConnectionAlive: true, // prevents AlreadyHasActiveConnectionError, needed for testing // TODO: Check if it should be disabled in production
	entities: [
		Course,
		User,
		Group,
		Participant,
		UserGroupRelation,
		Assignment,
		Assessment,
		AssessmentUserRelation,
		MailTemplate,
		AssignmentRegistration,
		GroupRegistrationRelation,
		CourseConfig,
		AssignmentTemplate,
		GroupSettings,
		AdmissionCriteria,
		AdmissionFromPreviousSemester,
		PartialAssessment,
		GroupEvent,
		AssessmentAllocation,
		AssessmentEvent,
		Submission,
		Subscriber
	],
	logging: loggingConfig.dbErrors ? ["error"] : undefined
};
