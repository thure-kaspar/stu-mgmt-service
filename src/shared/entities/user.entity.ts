import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { CourseUserRelation } from "./course-user-relation.entity";
import { UserGroupRelation } from "./user-group-relation.entity";
import { AssessmentUserRelation } from "./assessment-user-relation.entity";
import { UserRole } from "../enums";

@Entity("users")
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
	email: string;
	
	@Column()
	username: string;

	@Column()
	rzName: string;

    @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
    role: UserRole;
    
    @OneToMany(type => CourseUserRelation, courseUserRelations => courseUserRelations.user)
	courseUserRelations: CourseUserRelation[];
	
	@OneToMany(type => UserGroupRelation, userGroupRelation => userGroupRelation.user)
    userGroupRelations: UserGroupRelation[];
    
    @OneToMany(type => AssessmentUserRelation, assessmentUserRelation => assessmentUserRelation.user)
    assessmentUserRelations: AssessmentUserRelation[];
}
