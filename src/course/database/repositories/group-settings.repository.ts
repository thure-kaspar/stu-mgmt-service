import { EntityRepository, Repository } from "typeorm";
import { GroupSettings } from "../../entities/group-settings.entity";
import { GroupSettingsDto } from "../../dto/group-settings.dto";

@EntityRepository(GroupSettings)
export class GroupSettingsRepository extends Repository<GroupSettings> {

	/** Inserts the group settings into the database and returns them. */
	createGroupSettings(configId: number, settingsDto: GroupSettingsDto): Promise<GroupSettings> {
		const settings = this.create(settingsDto);
		return settings.save();
	}
	
	/** Retrieves the group settings. Throws error, if not found. */
	getById(id: number): Promise<GroupSettings> {
		return this.findOneOrFail(id);
	}

	/** Retrieves the group settings. Throws error, if not found. */
	getByCourseId(courseId: string): Promise<GroupSettings> {
		return this.findOneOrFail({ where: {
			courseConfig: { courseId }
		}});
	}

	/** Partially updates the group settings and returns them. */
	async updateGroupSettings(id: number, partial: Partial<GroupSettings>): Promise<GroupSettings> {
		await this.update(id, partial);
		return this.getById(id);
	}

}
