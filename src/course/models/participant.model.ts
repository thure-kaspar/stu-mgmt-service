import { UserId } from "../../shared/entities/user.entity";
import { CourseRole } from "../../shared/enums";
import { GroupId } from "../entities/group.entity";
import { Participant as ParticipantEntity } from "../entities/participant.entity";
import { AlreadyInGroupException, NotAGroupMemberException } from "../exceptions/custom-exceptions";
import { Group } from "./group.model";
import { ForbiddenException } from "@nestjs/common";

export class Participant {

	readonly id: number;
	readonly username: string;
	readonly displayName: string;
	readonly userId: UserId;
	readonly groupId: GroupId;
	readonly role: CourseRole;

	constructor(private participant: ParticipantEntity) {
		this.id = this.participant.id;
		this.userId = this.participant.userId;
		this.displayName = this.participant.user.displayName;
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

	/**
	 * Asserts that the participant is a member of the given group.
	 */
	isMemberOfGroup(group: Group): Participant {
		if (group.id !== this.groupId) {
			throw new NotAGroupMemberException(group.id, this.userId);
		}
		return this;
	}

	/**
	 * Asserts that the participant is allowed to remove the given participant from his group.
	 * Currently, it is only allowed if the given participant is the participant himself. // TODO
	 */
	isAllowedToRemoveGroupMember(other: Participant): Participant {
		if (!this.equals(other)) {
			throw new ForbiddenException("Students are not allowed to remove other group members.");
		}
		return this;
	}

	/**
	 * Asserts that the participant is allowed to remove their group. // TODO
	 */
	isAllowedToRemoveTheirGroup(): Participant {
		return this;
	}

	equals(other: Participant): boolean {
		return this.id === other.id;
	}

}
