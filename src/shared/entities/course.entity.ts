import { BaseEntity, Entity, Column, OneToMany, PrimaryColumn } from "typeorm";
import { CourseUserRelation } from "./course-user-relation.entity";
import { Group } from "./group.entity";
import { Assignment } from "./assignment.entity";

@Entity("courses")
export class Course extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    shortname: string;

    @Column()
    semester: string;

    @Column()
    title: string;

    @Column()
    isClosed: boolean;

    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
	link?: string;
	
	@Column()
	allowGroups: boolean;

	@Column()
	maxGroupSize: number;

    @OneToMany(type => CourseUserRelation, courseUserRelations => courseUserRelations.course)
	courseUserRelations: CourseUserRelation[];
	
	@OneToMany(type => Group, group => group.course)
    groups: Group[];
    
    @OneToMany(type => Assignment, assignment => assignment.course)
    assignments: Assignment[];
}
