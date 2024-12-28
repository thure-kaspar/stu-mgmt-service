import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	OneToOne
} from "typeorm";
import { User, UserId } from "../../shared/entities/user.entity";
import { CourseRole } from "../../shared/enums";
import { Course, CourseId } from "./course.entity";
import { UserGroupRelation } from "./user-group-relation.entity";
import { ToDto } from "../../shared/interfaces/to-dto.interface";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { DtoFactory } from "../../shared/dto-factory";

@Entity()
@Index("INDEX_CourseId_UserId", ["courseId", "userId"], { unique: true }) // Unique index to prevent user from joining same course multiple times
export class Participant implements ToDto<ParticipantDto> {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Course, course => course.participants, {
		onDelete: "CASCADE"
	})
	@JoinColumn()
	course?: Course;

	@Column()
	courseId: CourseId;

	@ManyToOne(() => User, user => user.participations, { onDelete: "CASCADE" })
	@JoinColumn()
	user?: User;

	@Column()
	userId: UserId;

	@OneToOne(() => UserGroupRelation, userGroupRelation => userGroupRelation.participant, {
		nullable: true
	})
	groupRelation?: UserGroupRelation;

	// @Column({ nullable: true })
	// groupRelationId?: number;

	@Column({ type: "enum", enum: CourseRole, default: CourseRole.STUDENT })
	role: CourseRole;

	@CreateDateColumn()
	joinedAt: Date;

	constructor(partial?: Partial<Participant>) {
		if (partial) Object.assign(this, partial);
	}

	toDto(): ParticipantDto {
		return {
			userId: this.userId,
			role: this.role,
			username: this.user?.username,
			displayName: this.user?.displayName,
			matrNr: this.user?.matrNr,
			email: this.user?.email,
			groupId: this.groupRelation?.groupId,
			group: this.groupRelation?.group
				? DtoFactory.createGroupDto(this.groupRelation.group)
				: undefined
		};
	}
}
