import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AssessmentAllocation } from "../../assessment/entities/assessment-allocation.entity";
import { AssessmentUserRelation } from "../../assessment/entities/assessment-user-relation.entity";
import { Participant } from "../../course/entities/participant.entity";
import { UserGroupRelation } from "../../course/entities/user-group-relation.entity";
import { UserSettings } from "../../user/entities/user-settings.entity";
import { UserRole } from "../enums";

export type UserId = string;

@Entity()
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ nullable: true })
	matrNr?: number;

	@Column({ nullable: true })
	email?: string;

	@Column({ unique: true })
	username: string;

	@Column()
	displayName: string;

	@Column({ type: "enum", enum: UserRole, default: UserRole.USER })
	role: UserRole;

	@OneToMany(type => Participant, participants => participants.user)
	participations: Participant[];

	@OneToMany(type => UserGroupRelation, userGroupRelation => userGroupRelation.user)
	userGroupRelations: UserGroupRelation[];

	@OneToMany(
		type => AssessmentUserRelation,
		assessmentUserRelation => assessmentUserRelation.user
	)
	assessmentUserRelations: AssessmentUserRelation[];

	@OneToMany(type => AssessmentAllocation, allocation => allocation.user)
	assessmentAllocations: AssessmentAllocation[];

	@OneToOne(() => UserSettings, userSettings => userSettings.user, { nullable: true })
	settings: UserSettings;

	constructor(partial?: Partial<User>) {
		if (partial) Object.assign(this, partial);
	}
}
