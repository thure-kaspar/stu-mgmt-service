import { EntityRepository, Repository } from "typeorm";
import { AdmissionCritera } from "../../entities/admission-criteria.entity";
import { AdmissionCriteriaDto } from "../../dto/admission-criteria.dto";

@EntityRepository(AdmissionCritera)
export class AdmissionCriteraRepository extends Repository<AdmissionCritera> {
	
	/** Inserts the admission criteria into the database and returns it. */
	async createAdmissionCriteria(configId: number, criteriaDto: AdmissionCriteriaDto): Promise<AdmissionCritera> {
		const criteria = new AdmissionCritera();
		criteria.courseConfigId = configId;
		criteria.admissionCriteria = criteriaDto;
		
		const saved = await criteria.save();
		return saved;
	}

	/** Retrieves the admission criteria. Throws error, if not found. */
	getById(id: number): Promise<AdmissionCritera> {
		return this.findOneOrFail(id);
	}

	/** Retrieves the admission criteria. Throws error, if not found. */
	getByCourseId(courseId: string): Promise<AdmissionCritera> {
		return this.findOneOrFail({ where: { 
			courseConfig: { courseId }
		}});
	}

	/** Updates the admission criteria. */
	async updateAssignmentCriteria(courseId: string, criteriaDto: AdmissionCriteriaDto): Promise<AdmissionCritera> {
		const criteria = await this.getByCourseId(courseId);
		criteria.admissionCriteria = criteriaDto;
		return criteria.save();
	}

	/** Deletes the admission criteria. */
	async removeAdmissionCriteria(courseId: string): Promise<boolean> {
		return (await this.delete({ courseConfig: { courseId }})).affected == 1 ? true : false;
	}

}
