import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from "typeorm";
import { Assessment } from "../../shared/entities/assessment.entity";
import { PartialAssessmentDto } from "../dto/partial-assessment.dto";

@Entity()
export class PartialAssessment extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => Assessment, assessment => assessment.partialAssessments, { onDelete: "CASCADE" })
	@JoinColumn()
	assessment: Assessment;

	@Column()
	assessmentId: string;

	@Column({ nullable: true })
	type?: string;

	@Column({ nullable: true })
	severity?: string;

	@Column({ nullable: true })
	points?: number;

	@Column({ nullable: true })
	comment?: string;
	
	toDto(): PartialAssessmentDto {
		return {
			assessmentId: this.assessmentId,
			type: this.type,
			severity: this.severity,
			comment: this.comment,
			points: this.points
		};
	}
	
}
