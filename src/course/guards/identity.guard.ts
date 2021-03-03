import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Participant } from "../models/participant.model";

/**
 * Only allows requests that refer to data about the requesting participant himself.
 * Additionally, requests by `LECTURER` and `TUTOR` will be allowed.
 */
@Injectable()
export class ParticipantIdentityGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const userId = request.params.userId;
		const participant = request.participant as Participant;

		if (participant.isLecturer() || participant.isTutor()) {
			return true;
		}

		// Check if requesting user is requesting information about himself
		if (request.user.id === userId) {
			return true;
		}

		throw new ForbiddenException(
			"Resource can only be accessed by its owner or privileged users."
		);
	}
}
