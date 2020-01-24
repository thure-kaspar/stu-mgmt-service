import { BaseEntity, Entity, PrimaryGeneratedColumn, OneToMany, Column, OneToOne, ManyToOne, CreateDateColumn } from "typeorm";
import { UserGroupRelation } from "./user-group-relation.entity";
import { Course } from "./course.entity";

@Entity("groups")
export class Group extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
	name: string;

	@Column()
	password: string;

	@Column()
	isClosed: boolean;
	
	@ManyToOne(type => Course, course => course.groups)
	course: Course;
	
	@Column()
	courseId: number;

	@OneToMany(type => UserGroupRelation, userGroupRelation => userGroupRelation.group)
	userGroupRelations: UserGroupRelation[];

	@CreateDateColumn()
	createdAt: Date;
}
