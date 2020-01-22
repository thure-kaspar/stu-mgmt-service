import { BaseEntity, Entity, PrimaryGeneratedColumn, OneToMany, Column, OneToOne } from "typeorm";
import { CourseGroupRelation } from "./course-group-relation.entity";
import { UserGroupRelation } from "./user-group-relation.entity";

Entity("groups")
export class Group extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToOne(type => CourseGroupRelation, courseGroupRelation => courseGroupRelation.course)
    courseGroupRelations: CourseGroupRelation;

    @OneToMany(type => UserGroupRelation, userGroupRelation => userGroupRelation.user)
    userGroupRelations: UserGroupRelation[];
}