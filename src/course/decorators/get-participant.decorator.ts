import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Retrieves the `participant` property of the `request`.
 * This property is set by the following guards:
 * - `CourseMemberGuard`. 
 */
export const GetParticipant = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	return request.participant;
});
