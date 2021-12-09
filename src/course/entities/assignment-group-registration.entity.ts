import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn
} from "typeorm";
import { Assignment } from "./assignment.entity";
import { GroupRegistrationRelation } from "./group-registration-relation.entity";
import { Group, GroupId } from "./group.entity";

@Entity()
@Index("IDX_ASSIGNMENT_GROUP", ["assignmentId", "groupId"], { unique: true })
export class AssignmentRegistration {
	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn()
	creationDate: Date;

	@ManyToOne(() => Assignment, { onDelete: "CASCADE" })
	assignment: Assignment;

	@Column()
	assignmentId: string;

	@ManyToOne(() => Group, { onDelete: "CASCADE" })
	group: Group;

	@Column()
	groupId: GroupId;

	@OneToMany(() => GroupRegistrationRelation, relation => relation.assignmentRegistration, {
		cascade: ["insert"]
	})
	groupRelations: GroupRegistrationRelation[];

	constructor(partial: Partial<AssignmentRegistration>) {
		Object.assign(this, partial);
	}
}
