import { EntityRepository, Repository } from "typeorm";
import { AdmissionCritera } from "../entities/admission-criteria.entity";
import { AdmissionCriteriaDto } from "../dto/course-config/admission-criteria.dto";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { CourseId } from "../entities/course.entity";

@EntityRepository(AdmissionCritera)
export class AdmissionCriteraRepository extends Repository<AdmissionCritera> {
	
	/** Inserts the admission criteria into the database and returns it. */
	async createAdmissionCriteria(configId: number, criteriaDto: AdmissionCriteriaDto): Promise<AdmissionCritera> {
		const criteria = new AdmissionCritera();
		criteria.courseConfigId = configId;
		criteria.admissionCriteria = criteriaDto;
		
		const saved = await this.save(criteria);
		return saved;
	}

	/** Retrieves the admission criteria. Throws error, if not found. */
	getById(id: number): Promise<AdmissionCritera> {
		return this.findOneOrFail(id);
	}

	/** Retrieves the admission criteria. Throws error, if not found. */
	async getByCourseId(courseId: CourseId): Promise<AdmissionCritera> {
		const criteria = await this.createQueryBuilder("criteria")
			.innerJoin("criteria.courseConfig", "c")
			.where("c.courseId = :courseId", { courseId })
			.getOne();

		if (!criteria) throw new EntityNotFoundError(AdmissionCritera, null);
		return criteria;
	}

	/** Updates the admission criteria. */
	async updateAdmissionCriteria(courseId: CourseId, criteriaDto: AdmissionCriteriaDto): Promise<AdmissionCritera> {
		const criteria = await this.getByCourseId(courseId);
		criteria.admissionCriteria = criteriaDto;
		return this.save(criteria);
	}

	/** Deletes the admission criteria. Returns true, if removal was successful. */
	async removeAdmissionCriteria(courseId: CourseId): Promise<boolean> {
		const criteria = await this.getByCourseId(courseId);
		const deleted = await this.remove(criteria);
		return !!deleted;
	}

}
