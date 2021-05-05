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

	/**
	 * Factory method for PartialAssessment.
	 * Generates a random `key`, if it is not included in the given `dto`.
	 */
	static create(assessmentId: string, dto?: Partial<PartialAssessmentDto>): PartialAssessment {
		const entity = new PartialAssessment();
		Object.assign(entity, dto || {});
		entity.assessmentId = assessmentId;
		entity.key = entity.key ? entity.key : "rnd-key-" + Math.floor(Math.random() * 9999999);
		return entity;
	}

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
