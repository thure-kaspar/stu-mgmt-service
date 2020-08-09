import { CourseRole } from "../../shared/enums";
import { AlreadyInGroupException } from "../exceptions/custom-exceptions";
import { Participant as ParticipantEntity } from "../entities/participant.entity";
import { GroupId } from "../entities/group.entity";
import { UserId } from "../../shared/entities/user.entity";

export class Participant {

	readonly id: number;
	readonly username: string;
	readonly rzName: string;
	readonly userId: UserId;
	readonly groupId: GroupId;
	readonly role: CourseRole;

	constructor(private participant: ParticipantEntity) {
		this.id = participant.id;
		this.userId = this.participant.userId;
		this.rzName = this.participant.user.rzName;
		this.username = this.participant.user.username;
		this.role = this.participant.role;
		this.groupId = this.participant.groupRelation?.groupId;
	}

	isStudent(): boolean {
		return this.participant.role === CourseRole.STUDENT;
	}

	isTutor(): boolean {
		return this.participant.role === CourseRole.TUTOR;
	}

	isLecturer(): boolean {
		return this.participant.role === CourseRole.LECTURER;
	}

	/**
	 * Asserts that the participant has no group.
	 * @throws AlreadyInGroupException
	 */
	hasNoGroup(): Participant {
		if (this.groupId) {
			throw new AlreadyInGroupException(this.userId, this.groupId);
		}
		return this;
	}

}
