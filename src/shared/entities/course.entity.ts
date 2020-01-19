import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { CourseUserRelation } from "./course-user-relation.entity";

@Entity("courses")
export class Course extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    courseId: number;

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

    @OneToMany(type => CourseUserRelation, courseUserRelations => courseUserRelations.course)
    courseUserRelations: CourseUserRelation[];
}