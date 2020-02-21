import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { CourseUserRelation } from "./course-user-relation.entity";
import { UserGroupRelation } from "./user-group-relation.entity";
import { AssessmentUserRelation } from "./assessment-user-relation.entity";
import { UserRoles } from "../enums";

@Entity("users")
@Unique(["email"])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    email: string;

    @Column()
    role: UserRoles;
    
    @OneToMany(type => CourseUserRelation, courseUserRelations => courseUserRelations.user)
	courseUserRelations: CourseUserRelation[];
	
	@OneToMany(type => UserGroupRelation, userGroupRelation => userGroupRelation.user)
    userGroupRelations: UserGroupRelation[];
    
    @OneToMany(type => AssessmentUserRelation, assessmentUserRelation => assessmentUserRelation.user)
    assessmentUserRelations: AssessmentUserRelation[];
}
