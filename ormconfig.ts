import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Config } from "./src/.config/config";
import { Activity } from "./src/activity/activity.entity";
import { AssessmentAllocation } from "./src/assessment/entities/assessment-allocation.entity";
import { AssessmentEvent } from "./src/assessment/entities/assessment-event.entity";
import { AssessmentUserRelation } from "./src/assessment/entities/assessment-user-relation.entity";
import { Assessment } from "./src/assessment/entities/assessment.entity";
import { PartialAssessment } from "./src/assessment/entities/partial-assessment.entity";
import { AdmissionCriteria } from "./src/course/entities/admission-criteria.entity";
import { AdmissionFromPreviousSemester } from "./src/course/entities/admission-from-previous-semester.entity";
import { AssignmentRegistration } from "./src/course/entities/assignment-group-registration.entity";
import { Assignment } from "./src/course/entities/assignment.entity";
import { CourseConfig } from "./src/course/entities/course-config.entity";
import { Course } from "./src/course/entities/course.entity";
import { GroupEvent } from "./src/course/entities/group-event.entity";
import { GroupRegistrationRelation } from "./src/course/entities/group-registration-relation.entity";
import { GroupSettings } from "./src/course/entities/group-settings.entity";
import { Group } from "./src/course/entities/group.entity";
import { Participant } from "./src/course/entities/participant.entity";
import { UserGroupRelation } from "./src/course/entities/user-group-relation.entity";
import { Subscriber } from "./src/notification/subscriber/subscriber.entity";
import { User } from "./src/shared/entities/user.entity";
import { Submission } from "./src/submission/submission.entity";
import { UserSettings } from "./src/user/entities/user-settings.entity";

const dbConfig = Config.get().db;

const typeOrmConfig: TypeOrmModuleOptions = {
	type: dbConfig.type as any,
	host: dbConfig.host,
	port: dbConfig.port,
	username: dbConfig.username,
	password: dbConfig.password,
	database: dbConfig.database,
	synchronize: dbConfig.synchronize,
	dropSchema: dbConfig.dropSchema || false,
	migrationsRun: false,
	migrations: ["dist/migrations/*.js"],
	keepConnectionAlive: true, // prevents AlreadyHasActiveConnectionError, needed for testing // TODO: Check if it should be disabled in production
	logging: Config.get().logger ? ["error"] : undefined,
	entities: [
		Course,
		User,
		UserSettings,
		Group,
		Participant,
		UserGroupRelation,
		Assignment,
		Assessment,
		AssessmentUserRelation,
		AssignmentRegistration,
		GroupRegistrationRelation,
		CourseConfig,
		GroupSettings,
		AdmissionCriteria,
		AdmissionFromPreviousSemester,
		PartialAssessment,
		GroupEvent,
		AssessmentAllocation,
		AssessmentEvent,
		Submission,
		Subscriber,
		Activity
	]
};

export default typeOrmConfig;
