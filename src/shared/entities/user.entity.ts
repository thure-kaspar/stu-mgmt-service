import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { CourseUserRelation } from "../../course/entities/course-user-relation.entity";
import { UserGroupRelation } from "../../course/entities/user-group-relation.entity";
import { AssessmentUserRelation } from "../../course/entities/assessment-user-relation.entity";
import { UserRole } from "../enums";

@Entity("users")
export class User extends BaseEntity {
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
    
    @OneToMany(type => CourseUserRelation, courseUserRelations => courseUserRelations.user)
	courseUserRelations: CourseUserRelation[];
	
	@OneToMany(type => UserGroupRelation, userGroupRelation => userGroupRelation.user)
    userGroupRelations: UserGroupRelation[];
    
    @OneToMany(type => AssessmentUserRelation, assessmentUserRelation => assessmentUserRelation.user)
    assessmentUserRelations: AssessmentUserRelation[];
}
