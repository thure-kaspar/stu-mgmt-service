import { BadRequestException } from "@nestjs/common";
import { Group } from "../entities/group.entity";
import { GroupClosedException, GroupFullException, InvalidPasswordException } from "../exceptions/custom-exceptions";

export class GroupModel {

	constructor(private group: Group) { }

	/**
	 * Asserts that the group is not closed.
	 * @throws GroupClosedException
	 */
	isNotClosed(): GroupModel {
		if (this.group.isClosed) {
			throw new GroupClosedException(this.group.id);
		}
		return this;
	}

	/**
	 * Asserts that the group has room for more members.
	 * @throws 
	 */
	hasCapacity(sizeMax: number): GroupModel {
		if (this.group.userGroupRelations.length >= sizeMax) {
			throw new GroupFullException(this.group.id);
		}
		return this;
	}

	/**
	 * Asserts that the group has at least minSize members.
	 * @throws GroupFullException if 
	 */
	hasAtLeastMinSize(sizeMin: number): GroupModel {
		if (this.group.userGroupRelations.length >= sizeMin) {
			throw new BadRequestException(`Group (${this.group.id}) does not have ${sizeMin} members.`);
		}
		return this;
	}

	/**
	 * Asserts that the given password is either correct or not required.
	 * @throws InvalidPasswordException if password is incorrect.
	 */
	acceptsPassword(password?: string): GroupModel {
		if (this.group.password && this.group.password !== password) {
			throw new InvalidPasswordException();
		}
		return this;
	}

}
