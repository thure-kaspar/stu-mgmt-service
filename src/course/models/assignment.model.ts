import { AssignmentState, AssignmentType, CollaborationType } from "../../shared/enums";
import { Assignment as AssignmentEntity, AssignmentId } from "../entities/assignment.entity";
import { CourseId } from "../entities/course.entity";

export class Assignment {
	readonly id: AssignmentId;
	readonly courseId: CourseId;
	readonly name: string;
	readonly collaboration: CollaborationType;
	readonly state: AssignmentState;
	readonly type: AssignmentType;
	readonly points: number;
	readonly bonusPoints?: number;
	readonly startDate?: Date;
	readonly endDate?: Date;

	constructor(assignment: AssignmentEntity) {
		this.id = assignment.id;
		this.courseId = assignment.courseId;
		this.name = assignment.name;
		this.collaboration = assignment.collaboration;
		this.state = assignment.state;
		this.type = assignment.type;
		this.points = assignment.points;
		this.bonusPoints = assignment.bonusPoints;
		this.startDate = assignment.startDate;
		this.endDate = assignment.endDate;
	}

	allowsGroups(): boolean {
		return (
			this.collaboration === CollaborationType.GROUP ||
			this.collaboration === CollaborationType.GROUP_OR_SINGLE
		);
	}

	allowsSubmissions(): boolean {
		return this.state === AssignmentState.IN_PROGRESS;
	}

	/**
	 * Returns `true`, if assignment's `state` differs from `oldState`.
	 */
	hasChangedState(oldState: AssignmentState): boolean {
		return oldState !== this.state;
	}

	/**
	 * Returns `true`, if assignment is now in `IN_PROGRESS` state and
	 * `oldState` was a different state.
	 */
	wasStarted(oldState?: AssignmentState): boolean {
		return (
			this.state === AssignmentState.IN_PROGRESS && oldState !== AssignmentState.IN_PROGRESS
		);
	}
}
