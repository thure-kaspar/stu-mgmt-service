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
		saved.admissionCriteria.id = saved.id;
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

	async updateAssignmentCriteria(id: number, partial: Partial<AdmissionCriteriaDto>): Promise<AdmissionCritera> {
		await this.update(id, partial);
		return this.getById(id);
	}

	async removeAdmissionCriteria(id: number): Promise<boolean> {
		return (await this.delete(id)).affected == 1 ? true : false;
	}

}
