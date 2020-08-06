import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AssessmentAllocation } from "../../course/entities/assessment-allocation.entity";
import { AssessmentUserRelation } from "../../course/entities/assessment-user-relation.entity";
import { ParticipantEntity } from "../../course/entities/participant.entity";
import { UserGroupRelation } from "../../course/entities/user-group-relation.entity";
import { UserRole } from "../enums";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: true })
	email: string;
	
	@Column({ unique: true })
	username: string;

	@Column()
	rzName: string;

    @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
    role: UserRole;
    
    @OneToMany(type => ParticipantEntity, participants => participants.user)
	participations: ParticipantEntity[];
	
	@OneToMany(type => UserGroupRelation, userGroupRelation => userGroupRelation.user)
    userGroupRelations: UserGroupRelation[];
    
    @OneToMany(type => AssessmentUserRelation, assessmentUserRelation => assessmentUserRelation.user)
	assessmentUserRelations: AssessmentUserRelation[];
	
	@OneToMany(type => AssessmentAllocation, allocation => allocation.user)
	assessmentAllocations: AssessmentAllocation[];

	constructor(partial?: Partial<User>) {
		if (partial) Object.assign(this, partial);
	}

}
