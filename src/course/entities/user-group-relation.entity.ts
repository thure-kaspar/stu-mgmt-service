import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../shared/entities/user.entity";
import { ParticipantEntity } from "./participant.entity";
import { Group } from "./group.entity";

@Entity("user_group_relations")
@Index("IDX_UserId_GroupId", ["userId", "groupId"], { unique: true })
export class UserGroupRelation {
    @PrimaryGeneratedColumn()
    id: number;

	@ManyToOne(type => User, user => user.userGroupRelations, { onDelete: "CASCADE" })
	@JoinColumn()
	user?: User;	

    @Column()
    userId: string;

	@ManyToOne(type => Group, group => group.userGroupRelations, { onDelete: "CASCADE" })
	@JoinColumn()
	group?: Group;

	@OneToOne(type => ParticipantEntity, participant => participant.groupRelation, { onDelete: "CASCADE" })
	@JoinColumn()
	participant?: ParticipantEntity;

	@Column({ unique: true }) // User can only have one group per course
	participantId: number;

    @Column()
	groupId: string;
	
	@CreateDateColumn()
	joinedAt: Date;
}
