import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column } from "typeorm";
import { Course } from "./course.entity";
import { Group } from "./group.entity";

@Entity("course_groups_relations")
export class CourseGroupRelation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Course, course => course.courseGroupRelations, { primary: true })
    course: Course;

    @Column()
	courseId: number;

    @ManyToOne(type => Group, group => group.courseGroupRelations, { primary: true })
    group: Group;

    @Column()
    groupId: string;

    @CreateDateColumn()
    createdAt: Date;
}