import { EntityRepository, Repository } from "typeorm";
import { GroupSettings } from "../entities/group-settings.entity";
import { GroupSettingsDto } from "../dto/course-config/group-settings.dto";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { CourseId } from "../entities/course.entity";

@EntityRepository(GroupSettings)
export class GroupSettingsRepository extends Repository<GroupSettings> {
	/** Inserts the group settings into the database and returns them. */
	createGroupSettings(configId: number, settingsDto: GroupSettingsDto): Promise<GroupSettings> {
		const settings = this.create(settingsDto);
		return this.save(settings);
	}

	/** Retrieves the group settings. Throws error, if not found. */
	getById(idNumber: number): Promise<GroupSettings> {
		return this.findOneOrFail({
			where: {
				id: idNumber
			}
		});
	}

	/** Retrieves the group settings. Throws error, if not found. */
	async getByCourseId(courseId: CourseId): Promise<GroupSettings> {
		const settings = await this.createQueryBuilder("settings")
			.innerJoin("settings.courseConfig", "c")
			.where("c.courseId = :courseId", { courseId })
			.getOne();

		if (!settings) throw new EntityNotFoundError(GroupSettings, null);
		return settings;
	}

	/** Partially updates the group settings and returns them. */
	async updateGroupSettings(
		courseId: CourseId,
		partial: Partial<GroupSettings>
	): Promise<GroupSettings> {
		const settings = await this.getByCourseId(courseId);
		const updated = this.create({ ...settings, ...partial });
		updated.courseConfigId = settings.courseConfigId; // Prevent assignment to wrong id
		return this.save(updated);
	}
}
