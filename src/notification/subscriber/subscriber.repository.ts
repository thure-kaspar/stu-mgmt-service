import { DataSource, Repository } from "typeorm";
import { CourseId } from "../../course/entities/course.entity";
import { SubscriberDto } from "./subscriber.dto";
import { Subscriber } from "./subscriber.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SubscriberRepository extends Repository<Subscriber> {
	constructor(private dataSource: DataSource) {
		super(Subscriber, dataSource.createEntityManager());
	  }
	
	async addOrUpdate(courseId: CourseId, subscriberDto: SubscriberDto): Promise<SubscriberDto> {
		const { name, url, events } = subscriberDto;

		let subscriber = await this.findOne({ where: { courseId, name } });

		if (!subscriber) {
			subscriber = this.create({ courseId, url, events });
		}

		subscriber.updateDate = new Date();
		subscriber.name = name;
		subscriber.url = url;
		subscriber.events = events;

		const saved = await this.save(subscriber);
		return saved.toDto();
	}

	async getSubscribersOfCourse(courseId: CourseId): Promise<SubscriberDto[]> {
		const subscribers = await this.find({
			where: { courseId },
			order: {
				name: "ASC"
			}
		});
		return subscribers.map(s => s.toDto());
	}

	async tryGet(courseId: CourseId, name: string): Promise<SubscriberDto | undefined> {
		const subscriber = await this.findOne({
			where: {
				courseId,
				name
			}
		});

		return subscriber?.toDto();
	}

	async get(courseId: CourseId, name: string): Promise<SubscriberDto> {
		const subscriber = await this.findOneOrFail({
			where: {
				courseId,
				name
			}
		});

		return subscriber.toDto();
	}

	async removeSubscriber(courseId: CourseId, name: string): Promise<void> {
		const subscriber = await this.findOneOrFail({ where: { courseId, name } });
		await this.remove(subscriber);
	}
}
