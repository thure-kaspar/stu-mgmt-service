import { CourseWithGroupSettings } from "../../models/course-with-group-settings.model";
import { Participant } from "../../models/participant.model";

export class CourseJoined {
	constructor(
		readonly course: CourseWithGroupSettings, 
		readonly participant: Participant
	) { }
}
