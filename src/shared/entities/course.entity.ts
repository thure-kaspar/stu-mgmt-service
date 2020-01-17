import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { User } from "./user.entity";

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

    @ManyToMany(type => User, user => user.courses)
    @JoinTable()
    users: User[];
}