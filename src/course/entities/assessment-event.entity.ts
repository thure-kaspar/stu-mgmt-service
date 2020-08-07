import { Entity, ManyToOne, Column } from "typeorm";
import { User, UserId } from "../../shared/entities/user.entity";
import { DtoFactory } from "../../shared/dto-factory";
import { Assessment } from "./assessment.entity";
import { AssessmentEventDto } from "../dto/assessment/assessment-event.dto";
import { EventEntity } from "../../shared/entities/event.entity";

@Entity()
export class AssessmentEvent extends EventEntity {

	@ManyToOne(type => Assessment, { onDelete: "CASCADE" })
	assessment: Assessment;

	@Column()
	assessmentId: string;

	@ManyToOne(type => User, { eager: true, onDelete: "CASCADE" })
	user: User;

	@Column()
	userId: UserId;

	constructor(event: string, assessmentId: string, userId: UserId, payload?: object) {
		super();
		this.event = event;
		this.assessmentId = assessmentId;
		this.userId = userId;
		this.payload = payload;
	}

	toDto(): AssessmentEventDto {
		return {
			event: this.event,
			assessmentId: this.assessmentId,
			userId: this.userId,
			user: this.user ? DtoFactory.createUserDto(this.user) : undefined,
			payload: this.payload,
			timestamp: this.timestamp
		};
	}
}
