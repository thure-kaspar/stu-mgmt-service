import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User, UserId } from "../../shared/entities/user.entity";
import { Assignment } from "./assignment.entity";
import { Group, GroupId } from "./group.entity";
import { Participant } from "./participant.entity";

@Entity()
@Unique("UNIQUE_ASSIGNMENT_USER", ["assignmentId", "userId"]) // User can only be registered for one group per assignment 
export class AssignmentRegistration {

	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn()
	creationDate: Date;

	@ManyToOne(type => Assignment, { onDelete: "CASCADE" })
	assignment: Assignment;

	@Column()
	assignmentId: string;

	@ManyToOne(type => User, { onDelete: "CASCADE" })
	user: User

	@Column()
	userId: UserId;

	@ManyToOne(type => Participant, { onDelete: "CASCADE" })
	participant: Participant

	@Column()
	participantId: number;

	@ManyToOne(type => Group, { onDelete: "CASCADE" })
	group: Group;

	@Column()
	groupId: GroupId;

	constructor(partial: Partial<AssignmentRegistration>) {
		Object.assign(this, partial);
	}

}
