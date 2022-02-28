import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Activity } from "./activity.entity";

/**
 * Event that tracks how frequently a student accesses this system.
 * At most one event will be stored in the database per day.
 */
export class ActivityEvent {
	readonly date: Date;

	constructor(readonly userId: string, readonly courseId: string) {
		this.date = new Date();
	}
}

@EventsHandler(ActivityEvent)
export class ActivityEventHandler implements IEventHandler<ActivityEvent> {
	constructor(@InjectRepository(Activity) private repo: Repository<Activity>) {}

	async handle(event: ActivityEvent): Promise<void> {
		const { userId, courseId, date } = event;

		const latestActivity = await this._tryGetLatestActivity(userId, courseId);

		if (!latestActivity || !isSameDay(date, latestActivity.date)) {
			await this.repo.insert(Activity.create(userId, courseId));
		}
	}

	_tryGetLatestActivity(userId: string, courseId: string): Promise<{ date: Date }> {
		return this.repo.findOne({
			select: ["date"],
			where: { userId, courseId },
			order: { date: "DESC" }
		});
	}
}

export function isSameDay(first: Date, second: Date): boolean {
	return (
		first.getDate() === second.getDate() &&
		first.getMonth() === second.getMonth() &&
		first.getFullYear() === second.getFullYear()
	);
}
