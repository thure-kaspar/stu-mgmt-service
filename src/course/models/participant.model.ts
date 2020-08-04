import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { AlreadyInGroupException } from "../exceptions/custom-exceptions";

export class ParticipantModel {

	constructor(private participant: ParticipantDto) { }

	/**
	 * Asserts that the participant has no group.
	 * @throws AlreadyInGroupException
	 */
	hasNoGroup(): ParticipantModel {
		if (this.participant.groupId) {
			throw new AlreadyInGroupException(this.participant.userId, this.participant.groupId);
		}
		return this;
	}

}
