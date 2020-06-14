import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from "typeorm";
import { Assignment } from "./assignment.entity";
import { User } from "../../shared/entities/user.entity";
import { Group } from "./group.entity";
import { AssessmentAllocationDto } from "../dto/assessment-allocation/assessment-allocation.dto";

@Entity()
@Unique("Unique_AssignmentId_GroupId_UserId", ["assignmentId", "groupId", "userId"]) // A group or user can only be assigned to one evaluator per assignment

export class AssessmentAllocation extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => Assignment, { onDelete: "CASCADE" })
	assignment: Assignment;

	@Column()
	assignmentId: string;

	/** The user, whose solution should be evaluated. */
	@ManyToOne(type => User, { nullable: true, onDelete: "CASCADE" })
	user: User;

	@Column({ nullable: true })
	userId: string;

	/** The group, whose solution should be evaluated. */
	@ManyToOne(type => Group, { nullable: true, onDelete: "CASCADE" })
	group: Group;

	@Column({ nullable: true })
	groupId: string;

	@ManyToOne(type => User, { onDelete: "CASCADE" })
	assignedEvaluator: User;
	
	@Column()
	assignedEvaluatorId: string;

	toDto(): AssessmentAllocationDto {
		return {
			assignmentId: this.assignmentId,
			assignedEvaluatorId: this.assignedEvaluatorId,
			userId: this.userId ?? undefined,
			groupId: this.groupId ?? undefined
		};
	}
}
