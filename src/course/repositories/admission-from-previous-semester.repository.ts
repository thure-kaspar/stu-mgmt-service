import { DataSource, EntityNotFoundError, Repository } from "typeorm";
import { AdmissionFromPreviousSemester } from "../entities/admission-from-previous-semester.entity";
import { CourseId } from "../entities/course.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AdmissionFromPreviousSemesterRepository extends Repository<AdmissionFromPreviousSemester> {
		constructor(private dataSource: DataSource) {
			super(AdmissionFromPreviousSemester, dataSource.createEntityManager());
		  }
		
	/** Retrieves the admission criteria. Throws error, if not found. */
	getById(id_number: number): Promise<AdmissionFromPreviousSemester> {
		return this.findOneOrFail({
			where: {
				id: id_number
			}
		});
	}

	/** Retrieves the AdmissionFromPreviousSemester. Throws error, if not found. */
	async getByCourseId(courseId: CourseId): Promise<AdmissionFromPreviousSemester> {
		const admission = await this.tryGetByCourseId(courseId);

		if (!admission) throw new EntityNotFoundError(AdmissionFromPreviousSemester, courseId);
		return admission;
	}

	/** Retrieves the admission criteria or `undefined` if it does not exist. */
	async tryGetByCourseId(courseId: CourseId): Promise<AdmissionFromPreviousSemester | undefined> {
		const admission = await this.createQueryBuilder("admission")
			.innerJoin("admission.courseConfig", "c")
			.where("c.courseId = :courseId", { courseId })
			.getOne();

		return admission;
	}
}
