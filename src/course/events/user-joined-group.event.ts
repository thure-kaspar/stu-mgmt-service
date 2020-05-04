import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { GroupEvent } from "../entities/group-event.entity";
import { Repository } from "typeorm";

export class UserJoinedGroupEvent {
	constructor(
		public readonly groupId: string,
		public readonly userId: string
	) { }
}

@EventsHandler(UserJoinedGroupEvent)
export class UserJoinedGroupHandler implements IEventHandler<UserJoinedGroupEvent> {

	constructor(@InjectRepository(GroupEvent) private groupEvents: Repository<GroupEvent>) { }

	handle(event: UserJoinedGroupEvent): void {
		this.groupEvents.insert({...event, event: UserJoinedGroupEvent.name });
	}
	
}
