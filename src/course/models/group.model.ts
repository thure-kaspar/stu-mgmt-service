import { BadRequestException } from "@nestjs/common";
import { Group as GroupEntity } from "../entities/group.entity";
import { GroupClosedException, GroupFullException, InvalidPasswordException } from "../exceptions/custom-exceptions";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { GroupUpdateDto } from "../dto/group/group.dto";

export class Group {

	readonly id: string;
	readonly name: string;
	readonly members: ParticipantDto[];
	readonly password?: string;
	readonly isClosed: boolean;

	constructor(private group: GroupEntity) {
		this.id = group.id;
		this.name = group.name;
		this.isClosed = group.isClosed;
		this.password = group.password;
		this.members = group.userGroupRelations.map(rel => rel.participant.toDto());
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
		return update.name && (update.name !== this.name);
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
			throw new BadRequestException(`Group (${this.group.id}) does not have ${sizeMin} members.`);
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
