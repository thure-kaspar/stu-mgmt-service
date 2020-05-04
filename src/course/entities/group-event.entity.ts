import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn } from "typeorm";
import { Group } from "./group.entity";
import { User } from "../../shared/entities/user.entity";
import { GroupEventDto } from "../dto/group/group-event.dto";
import { DtoFactory } from "../../shared/dto-factory";

@Entity()
export class GroupEvent extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToMany(type => Group)
	group: Group;

	@Column()
	groupId: string;

	@ManyToMany(type => User, { eager: true })
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
			user: DtoFactory.createUserDto(this.user),
			event: this.event,
			payload: this.payload,
			timestamp: this.timestamp
		};
	}
}
