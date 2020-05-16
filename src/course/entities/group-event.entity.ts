import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinTable } from "typeorm";
import { Group } from "./group.entity";
import { User } from "../../shared/entities/user.entity";
import { GroupEventDto } from "../dto/group/group-event.dto";
import { DtoFactory } from "../../shared/dto-factory";

@Entity()
export class GroupEvent extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => Group, group => group.history, { onDelete: "CASCADE" })
	group: Group;

	@Column()
	groupId: string;

	@ManyToOne(type => User, { eager: true, onDelete: "CASCADE" })
	user: User;

	@Column()
	userId: string;

	@Column()
	event: string;

	@Column({ type: "json", nullable: true })
	payload: object;

	@CreateDateColumn()
	timestamp: Date;

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
