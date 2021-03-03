import { AssignmentState, AssignmentType, CollaborationType } from "../../shared/enums";
import { Assignment as AssignmentEntity, AssignmentId } from "../entities/assignment.entity";
import { CourseId } from "../entities/course.entity";
import { AssignmentNotInReviewStateException } from "../exceptions/custom-exceptions";

export class Assignment {
	readonly id: AssignmentId;
	readonly courseId: CourseId;
	readonly collaboration: CollaborationType;
	readonly state: AssignmentState;
	readonly type: AssignmentType;
	readonly points: number;
	readonly bonusPoints?: number;
	readonly startDate?: Date;
	readonly endDate?: Date;

	constructor(private assignment: AssignmentEntity) {
		this.id = assignment.id;
		this.courseId = assignment.courseId;
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
		return oldState !== this.assignment.state;
	}

	/**
	 * Returns `true`, if assignment is now in `IN_PROGRESS` state and
	 * `oldState` was a different state.
	 */
	wasStarted(oldState?: AssignmentState): boolean {
		return (
			this.assignment.state === AssignmentState.IN_PROGRESS &&
			oldState !== AssignmentState.IN_PROGRESS
		);
	}

	/**
	 * Asserts that the assignment is in `IN_REVIEW`.
	 * @throws `AssignmentNotInReviewStateException`
	 */
	mustBeInReview(): Assignment {
		if (this.state !== AssignmentState.IN_REVIEW) {
			throw new AssignmentNotInReviewStateException(this.id);
		}
		return this;
	}
}
