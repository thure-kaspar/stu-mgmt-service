import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { GroupEvent } from "../entities/group-event.entity";
import { Repository } from "typeorm";
import { GroupId } from "../entities/group.entity";
import { UserId } from "../../shared/entities/user.entity";

export class UserJoinedGroupEvent {
	constructor(
		public readonly groupId: GroupId,
		public readonly userId: UserId
	) { }
}

@EventsHandler(UserJoinedGroupEvent)
export class UserJoinedGroupHandler implements IEventHandler<UserJoinedGroupEvent> {

	constructor(@InjectRepository(GroupEvent) private groupEvents: Repository<GroupEvent>) { }

	handle(event: UserJoinedGroupEvent): void {
		this.groupEvents.insert({...event, event: UserJoinedGroupEvent.name });
	}
	
}
