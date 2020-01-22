import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { User } from "./user.entity";
import { Group } from "./group.entity";

@Entity("user_group_relations")
export class UserGroupRelation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.userGroupRelations, { primary: true })
    user: User;

    @Column()
    userId: number;

    @ManyToOne(type => Group, group => group.userGroupRelations, { primary: true })
    group: Group;

    @Column()
    groupId: string;
}