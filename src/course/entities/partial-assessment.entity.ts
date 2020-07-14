import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PartialAssessmentDto, Severity } from "../dto/assessment/partial-assessment.dto";
import { Assessment } from "./assessment.entity";

@Entity()
export class PartialAssessment {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => Assessment, assessment => assessment.partialAssessments, { onDelete: "CASCADE" })
	@JoinColumn()
	assessment: Assessment;

	@Column()
	assessmentId: string;

	@Column()
	title: string;

	@Column({ nullable: true })
	type?: string;

	@Column({ nullable: true, enum: Severity })
	severity?: Severity;

	@Column({ nullable: true })
	points?: number;

	@Column({ nullable: true })
	comment?: string;
	
	toDto(): PartialAssessmentDto {
		return {
			id: this.id,
			assessmentId: this.assessmentId,
			title: this.title,
			type: this.type ?? undefined,
			severity: this.severity ?? undefined,
			comment: this.comment ?? undefined,
			points: this.points ?? undefined
		};
	}
	
}
