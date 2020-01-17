import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, ManyToMany } from "typeorm";
import { Course } from "./course.entity";

@Entity("users")
@Unique(["email"])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    email: string;

    @Column()
    role: string;

    @ManyToMany(type => Course, course => course.users)
    courses: Course[];
}