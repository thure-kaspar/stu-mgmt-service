import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinTable } from "typeorm";
import { Group } from "./group.entity";
import { User } from "../../shared/entities/user.entity";
import { GroupEventDto } from "../dto/group/group-event.dto";
import { DtoFactory } from "../../shared/dto-factory";
import { EventEntity } from "../../shared/entities/event.entity";

@Entity()
export class GroupEvent extends EventEntity {
	@ManyToOne(type => Group, group => group.history, { onDelete: "CASCADE" })
	group: Group;

	@Column()
	groupId: string;

	@ManyToOne(type => User, { eager: true, onDelete: "CASCADE" })
	user: User;

	@Column()
	userId: string;

	toDto(): GroupEventDto {
		return {
			event: this.event,
			userId: this.userId,
			user: this.user ? DtoFactory.createUserDto(this.user) : undefined,
			groupId: this.groupId,
			payload: this.payload,
			timestamp: this.timestamp
		};
	}
	
}

/** Replays the events by iterating from oldest to newest event and executes the given funtion for each event. */
export function replayEvents(events: GroupEvent[], processEvent: (event: GroupEvent) => void): void {
	for (let i = events.length - 1; i >= 0; i--){
		processEvent(events[i]);
	}
}
