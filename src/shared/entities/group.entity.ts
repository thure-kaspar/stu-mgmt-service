import { BaseEntity, Entity, PrimaryGeneratedColumn, OneToMany, Column, OneToOne, CreateDateColumn, JoinColumn, ManyToOne } from "typeorm";
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
	
	@ManyToOne(type => Course, course => course.groups, { onDelete: "CASCADE" })
	@JoinColumn()
	course: Course;
	
	@Column()
	courseId: string;

	@OneToMany(type => UserGroupRelation, userGroupRelation => userGroupRelation.group)
	userGroupRelations: UserGroupRelation[];

	@OneToMany(type => Assessment, assessment => assessment.group)
    assessments: Assessment[];
}
