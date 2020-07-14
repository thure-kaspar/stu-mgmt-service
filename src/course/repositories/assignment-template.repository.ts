import { EntityRepository, Repository } from "typeorm";
import { AssignmentTemplate } from "../entities/assignment-template.entity";
import { AssignmentTemplateDto } from "../dto/course-config/assignment-template.dto";

@EntityRepository(AssignmentTemplate)
export class AssignmentTemplateRepository extends Repository<AssignmentTemplate> {

	/** Inserts a assignment template into the database and returns it. */
	createAssignmentTemplate(configId: number, templateDto: AssignmentTemplateDto): Promise<AssignmentTemplate> { 
		const template = this.create(templateDto);
		template.courseConfigId = configId;
		return this.save(template);
	}

	/** Retrieves a template. Throws error, if template with given id does not exist. */
	getTemplateById(id: number): Promise<AssignmentTemplate> {
		return this.findOneOrFail(id);
	}

	/** Retrieves all templates of a course. */
	getTemplatesByCourseId(courseId: string): Promise<AssignmentTemplate[]> {
		return this.createQueryBuilder("template")
			.innerJoin("template.courseConfig", "c")
			.where("c.courseId = :courseId", { courseId })
			.getMany();
	}

	/** Partially updates the template and returns it. */
	async updateTemplate(id: number, partial: Partial<AssignmentTemplate>): Promise<AssignmentTemplate> {
		await this.update(id, partial);
		return this.getTemplateById(id);
	}

	/** Removes a template from the database. Returns true, if removal was successful. */
	async removeTemplate(id: number): Promise<boolean> {
		return (await this.delete(id)).affected == 1 ? true : false;
	}

}
