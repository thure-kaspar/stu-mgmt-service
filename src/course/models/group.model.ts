import { BadRequestException } from "@nestjs/common";
import { GroupUpdateDto } from "../dto/group/group.dto";
import { Group as GroupEntity } from "../entities/group.entity";
import {
	GroupClosedException,
	GroupFullException,
	InvalidPasswordException
} from "../exceptions/custom-exceptions";
import { Participant } from "./participant.model";

export class Group {
	readonly id: string;
	readonly name: string;
	members: Participant[];
	readonly password?: string;
	readonly isClosed: boolean;

	constructor(private group: GroupEntity) {
		this.id = group.id;
		this.name = group.name;
		this.isClosed = group.isClosed;
		this.password = group.password;
		this.members = group.userGroupRelations.map(rel => new Participant(rel.participant));
	}

	/** Returns the amount of group members. */
	get size(): number {
		return this.members.length;
	}

	/**
	 * Returns `true`, if the group is not closed and has no password.
	 */
	isOpen(): boolean {
		return !(this.isClosed || this.password);
	}

	/**
	 * Asserts that the group is not closed.
	 * @throws GroupClosedException
	 */
	isNotClosed(): Group {
		if (this.isClosed) {
			throw new GroupClosedException(this.group.id);
		}
		return this;
	}

	/**
	 * Returns `true`, if the `GroupUpdateDto` is setting the `isClosed` property to `true`
	 * and the group is currently not closed.
	 */
	wantsToClose(update: GroupUpdateDto): boolean {
		return update.isClosed === true && !this.isClosed;
	}

	/**
	 * Returns `true`, if `GroupUpdateDto` contains a new name.
	 * Returns `false`, if name was unchanged or undefined.
	 */
	wantsToChangeName(update: GroupUpdateDto): boolean {
		return update.name && update.name !== this.name;
	}

	/**
	 * Returns `true`, if the group size is below the specified min size.
	 */
	isTooSmall(sizeMin: number): boolean {
		return this.members.length < sizeMin;
	}

	/**
	 * Returns `true`, if the group is not closed, has no password and its size is below
	 * the specified max size.
	 */
	isJoinable(sizeMax: number): boolean {
		return this.isOpen() && this.members.length < sizeMax;
	}

	/**
	 * Asserts that the group has room for more members.
	 * @throws
	 */
	hasCapacity(sizeMax: number): Group {
		if (this.members.length >= sizeMax) {
			throw new GroupFullException(this.group.id);
		}
		return this;
	}

	/**
	 * Asserts that the group has at least minSize members.
	 * @throws GroupFullException if
	 */
	hasAtLeastMinSize(sizeMin: number): Group {
		if (this.members.length >= sizeMin) {
			throw new BadRequestException(
				`Group (${this.group.id}) does not have ${sizeMin} members.`
			);
		}
		return this;
	}

	/**
	 * Asserts that the given password is either correct or not required.
	 * @throws InvalidPasswordException if password is incorrect.
	 */
	acceptsPassword(password?: string): Group {
		if (this.group.password && this.group.password !== password) {
			throw new InvalidPasswordException();
		}
		return this;
	}
}
