import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { CourseUserRelation } from "./course-user-relation.entity";

@Entity("users")
@Unique(["email"])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    email: string;

    @Column()
    role: string;
    
    @OneToMany(type => CourseUserRelation, courseUserRelations => courseUserRelations.user)
    courseUserRelations: CourseUserRelation[];
}