import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MarkerDto } from "../dto/marker.dto";
import { PartialAssessmentDto } from "../dto/partial-assessment.dto";
import { Assessment } from "./assessment.entity";

@Entity()
@Index("IDX_AssessmentId_Key", ["assessmentId", "key"], { unique: true })
export class PartialAssessment {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => Assessment, assessment => assessment.partialAssessments, {
		onDelete: "CASCADE"
	})
	@JoinColumn()
	assessment: Assessment;

	@Column()
	assessmentId: string;

	@Column()
	key: string;

	@Column()
	title: string;

	@Column()
	draftOnly: boolean;

	@Column({ type: "float", nullable: true })
	points?: number;

	@Column({ nullable: true })
	comment?: string;

	@Column({ type: "json", nullable: true })
	markers?: MarkerDto[];

	toDto(): PartialAssessmentDto {
		return {
			key: this.key,
			title: this.title,
			draftOnly: this.draftOnly,
			comment: this.comment ?? undefined,
			points: this.points ?? undefined,
			markers: this.markers ?? undefined
		};
	}
}
