import { BaseEntity, Entity, Column, OneToMany, PrimaryColumn, Index, OneToOne } from "typeorm";
import { CourseUserRelation } from "./course-user-relation.entity";
import { Group } from "./group.entity";
import { Assignment } from "./assignment.entity";
import { CourseConfig } from "../../course/entities/course-config.entity";

@Entity("courses")
@Index("IDX_Shortname_Semester", ["shortname", "semester"], { unique: true })
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
	link?: string;

    @OneToMany(type => CourseUserRelation, courseUserRelations => courseUserRelations.course, { cascade: ["insert"] })
	courseUserRelations: CourseUserRelation[];
	
	@OneToMany(type => Group, group => group.course)
    groups: Group[];
    
    @OneToMany(type => Assignment, assignment => assignment.course)
	assignments: Assignment[];
	
	@OneToOne(type => CourseConfig, config => config.course, { cascade: ["insert"] })
	config: CourseConfig;
}
