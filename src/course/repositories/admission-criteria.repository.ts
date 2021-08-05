import { EntityRepository, Repository } from "typeorm";
import { AdmissionCriteria } from "../entities/admission-criteria.entity";
import { AdmissionCriteriaDto } from "../dto/course-config/admission-criteria.dto";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { CourseId } from "../entities/course.entity";
import { CourseConfigRepository } from "./course-config.repository";

@EntityRepository(AdmissionCriteria)
export class AdmissionCriteriaRepository extends Repository<AdmissionCriteria> {
	/** Inserts the admission criteria into the database and returns it. */
	async createAdmissionCriteria(
		configId: number,
		criteriaDto: AdmissionCriteriaDto
	): Promise<AdmissionCriteria> {
		const criteria = new AdmissionCriteria();
		criteria.courseConfigId = configId;
		criteria.admissionCriteria = criteriaDto;

		const saved = await this.save(criteria);
		return saved;
	}

	/** Retrieves the admission criteria. Throws error, if not found. */
	getById(id: number): Promise<AdmissionCriteria> {
		return this.findOneOrFail(id);
	}

	/** Retrieves the admission criteria. Throws error, if not found. */
	async getByCourseId(courseId: CourseId): Promise<AdmissionCriteria> {
		const criteria = await this.tryGetByCourseId(courseId);

		if (!criteria) throw new EntityNotFoundError(AdmissionCriteria, courseId);
		return criteria;
	}

	/** Retrieves the admission criteria or `undefined` if it does not exist. */
	async tryGetByCourseId(courseId: CourseId): Promise<AdmissionCriteria> {
		const criteria = await this.createQueryBuilder("criteria")
			.innerJoin("criteria.courseConfig", "c")
			.where("c.courseId = :courseId", { courseId })
			.getOne();

		return criteria;
	}

	/** Updates the admission criteria. */
	async updateAdmissionCriteria(
		courseId: CourseId,
		criteriaDto: AdmissionCriteriaDto
	): Promise<AdmissionCriteria> {
		const criteria = (await this.tryGetByCourseId(courseId)) || new AdmissionCriteria();
		const courseConfigId = criteria.courseConfigId ?? (await this.getCourseConfigId(courseId));

		criteria.admissionCriteria = criteriaDto;
		criteria.courseConfigId = courseConfigId;

		return this.save(criteria);
	}

	/** Deletes the admission criteria. Returns true, if removal was successful. */
	async removeAdmissionCriteria(courseId: CourseId): Promise<boolean> {
		const criteria = await this.getByCourseId(courseId);
		const deleted = await this.remove(criteria);
		return !!deleted;
	}

	/** Looks up the corresponding `courseConfigId` for the given course. */
	private async getCourseConfigId(courseId: string): Promise<number> {
		const courseConfigRepo = this.manager.getCustomRepository(CourseConfigRepository);
		const { id } = await courseConfigRepo.getByCourseId(courseId);
		return id;
	}
}
