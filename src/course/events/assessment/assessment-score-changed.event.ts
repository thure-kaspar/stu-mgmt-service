import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { AssessmentEvent } from "../../entities/assessment-event.entity";
import { Repository } from "typeorm";
import { UserId } from "../../../shared/entities/user.entity";

export class AssessmentScoreChanged {
	constructor(
		public assessmentId: string,
		public userId: UserId,
		public payload: { oldScore: number; newScore: number }
	) {}
}

@EventsHandler(AssessmentScoreChanged)
export class AssessmentScoreChangedHandler implements IEventHandler<AssessmentScoreChanged> {
	constructor(
		@InjectRepository(AssessmentEvent) private assessmentEvents: Repository<AssessmentEvent>
	) {}

	handle(event: AssessmentScoreChanged): void {
		this.assessmentEvents.insert({ ...event, event: AssessmentScoreChanged.name });
	}
}
