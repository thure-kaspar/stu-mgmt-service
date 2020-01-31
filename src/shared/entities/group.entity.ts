import { BaseEntity, Entity, PrimaryGeneratedColumn, OneToMany, Column, OneToOne, CreateDateColumn } from "typeorm";
import { UserGroupRelation } from "./user-group-relation.entity";
import { Course } from "./course.entity";
import { Assessment } from "./assessment.entity";

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

	@CreateDateColumn()
	createdAt: Date;
	
	@OneToOne(type => Course, course => course.groups)
	course: Course;
	
	@Column()
	courseId: string;

	@OneToMany(type => UserGroupRelation, userGroupRelation => userGroupRelation.group)
	userGroupRelations: UserGroupRelation[];

	@OneToMany(type => Assessment, assessment => assessment.group)
    assessments: Assessment[];
}
