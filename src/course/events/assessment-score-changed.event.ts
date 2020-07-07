import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { AssessmentEvent } from "../entities/assessment-event.entity";
import { Repository } from "typeorm";

export class AssessmentScoreChangedEvent {
	constructor(
		public assessmentId: string,
		public userId: string,
		public payload: { oldScore: number; newScore: number }
	) { }
}

@EventsHandler(AssessmentScoreChangedEvent)
export class AssessmentScoreChangedHandler implements IEventHandler<AssessmentScoreChangedEvent> {

	constructor(@InjectRepository(AssessmentEvent) private assessmentEvents: Repository<AssessmentEvent>) { }

	handle(event: AssessmentScoreChangedEvent): void {
		this.assessmentEvents.insert({...event, event: AssessmentScoreChangedEvent.name });
	}

}
