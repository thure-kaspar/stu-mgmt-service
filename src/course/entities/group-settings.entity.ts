import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { GroupSettingsDto } from "../dto/course-config/group-settings.dto";
import { CourseConfig } from "./course-config.entity";

@Entity()
export class GroupSettings {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(type => CourseConfig, courseConfig => courseConfig.groupSettings, { onDelete: "CASCADE" })
	@JoinColumn()
	courseConfig: CourseConfig;

	@Column()
	courseConfigId: number;

	@Column()
	allowGroups: boolean;

	@Column({ nullable: true })
	nameSchema: string;

	@Column()
	sizeMin: number;

	@Column()
	sizeMax: number;

	@Column()
	selfmanaged: boolean;

	@Column()
	autoJoinGroupOnCourseJoined: boolean;

	@Column()
	mergeGroupsOnAssignmentStarted: boolean;

	constructor(partial?: Partial<GroupSettings>) {
		if (partial) Object.assign(this, partial);
	}

	toDto(): GroupSettingsDto {
		return {
			allowGroups: this.allowGroups,
			nameSchema: this.nameSchema ?? undefined,
			sizeMin: this.sizeMin,
			sizeMax: this.sizeMax,
			selfmanaged: this.selfmanaged,
			autoJoinGroupOnCourseJoined: this.autoJoinGroupOnCourseJoined,
			mergeGroupsOnAssignmentStarted: this.mergeGroupsOnAssignmentStarted
		};
	}

}
