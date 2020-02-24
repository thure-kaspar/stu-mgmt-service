import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToOne, CreateDateColumn, Index, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { Group } from "./group.entity";

@Entity("user_group_relations")
@Index(["userId", "groupId"], { unique: true })
export class UserGroupRelation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

	@ManyToOne(type => User, user => user.userGroupRelations, { onDelete: "CASCADE" })
	@JoinColumn()
	user: User;	

    @Column()
    userId: string;

	@ManyToOne(type => Group, group => group.userGroupRelations, { onDelete: "CASCADE" })
	@JoinColumn()
	group: Group;

    @Column()
	groupId: string;
	
	@CreateDateColumn()
	joinedAt: Date;
}
