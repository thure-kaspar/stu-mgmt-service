import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToOne, CreateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Group } from "./group.entity";

@Entity("user_group_relations")
export class UserGroupRelation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

	@ManyToOne(type => User, user => user.userGroupRelations)
	user: User;	

    @Column()
    userId: number;

	@ManyToOne(type => Group, group => group.userGroupRelations)
	group: Group;

    @Column()
	groupId: string;
	
	@CreateDateColumn()
	joinedAt: Date;
}
