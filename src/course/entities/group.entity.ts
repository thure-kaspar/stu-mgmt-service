import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { AssessmentAllocation } from "./assessment-allocation.entity";
import { Assessment } from "./assessment.entity";
import { Course, CourseId } from "./course.entity";
import { GroupEvent } from "./group-event.entity";
import { UserGroupRelation } from "./user-group-relation.entity";

export type GroupId = string;

@Entity("groups")
@Unique("Unique_Name_CourseId", ["name", "courseId"]) // Enforce unique group names in course
export class Group {
    @PrimaryGeneratedColumn("uuid")
    id: GroupId;

    @Column()
	name: string;

	@Column({ nullable: true })
	password: string;

	@Column()
	isClosed: boolean;

	@CreateDateColumn()
	createdAt: Date;
	
	@ManyToOne(type => Course, course => course.groups, { onDelete: "CASCADE" })
	@JoinColumn()
	course: Course;
	
	@Column()
	courseId: CourseId;

	@OneToMany(type => UserGroupRelation, userGroupRelation => userGroupRelation.group)
	userGroupRelations: UserGroupRelation[];

	@OneToMany(type => Assessment, assessment => assessment.group)
	assessments: Assessment[];
	
	@OneToMany(type => GroupEvent, groupEvent => groupEvent.group)
	history: GroupEvent[];

	@OneToMany(type => AssessmentAllocation, allocation => allocation.group)
	assessmentAllocations: AssessmentAllocation[]; 
}
