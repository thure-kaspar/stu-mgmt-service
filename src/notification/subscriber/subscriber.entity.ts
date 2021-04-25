import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Course, CourseId } from "../../course/entities/course.entity";
import { ToDto } from "../../shared/interfaces/to-dto.interface";
import { SubscribedEvents, SubscriberDto } from "./subscriber.dto";

@Entity()
@Index("IDX_Name_CourseId", ["name", "courseId"], { unique: true })
export class Subscriber implements ToDto<SubscriberDto> {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	courseId: CourseId;

	@ManyToOne(() => Course, { onDelete: "CASCADE" })
	course: Course;

	@Column()
	url: string;

	@Column({ type: "json", nullable: true })
	events?: SubscribedEvents;

	@Column()
	updateDate: Date;

	toDto(): SubscriberDto {
		return {
			name: this.name,
			url: this.url,
			events: this.events,
			updateDate: this.updateDate
		};
	}
}
