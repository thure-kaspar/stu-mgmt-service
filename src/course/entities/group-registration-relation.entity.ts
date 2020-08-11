import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, Index } from "typeorm";
import { AssignmentRegistration } from "./assignment-group-registration.entity";
import { Participant } from "./participant.entity";

@Entity()
@Index("IDX_AssignmentRegistration_Participant", ["assignmentRegistrationId", "participantId"], { unique: true })
export class GroupRegistrationRelation {

	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn()
	creationDate: Date;

	@ManyToOne(() => AssignmentRegistration, { onDelete: "CASCADE" })
	assignmentRegistration: AssignmentRegistration;

	@Column()
	assignmentRegistrationId: number;

	@ManyToOne(() => Participant, { onDelete: "CASCADE" })
	participant: Participant;

	@Column()
	participantId: number;

	constructor(partial: Partial<GroupRegistrationRelation>) {
		Object.assign(this, partial);
	}

}
