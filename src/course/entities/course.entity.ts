import { Column, Entity, Index, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Assignment } from "./assignment.entity";
import { CourseConfig } from "./course-config.entity";
import { CourseUserRelation } from "./course-user-relation.entity";
import { Group } from "./group.entity";

export type CourseId = string;

@Entity("courses")
@Index("IDX_Shortname_Semester", ["shortname", "semester"], { unique: true })
export class Course {
    @PrimaryColumn()
    id: CourseId;

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
