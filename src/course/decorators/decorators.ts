import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Retrieves the `course` property of the `request`.
 * This property is set by the following guards:
 * - `CourseMemberGuard`
 */
export const GetCourse = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	return ctx.switchToHttp().getRequest().course;
});

/**
 * Retrieves the `participant` property of the `request`.  
 * It contains the participant that issued the request.
 * This property is set by the following guards:
 * - `CourseMemberGuard`
 */
export const GetParticipant = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	return ctx.switchToHttp().getRequest().participant;
});

/**
 * Retrieves the `selectedParticipant` property of the `request`.  
 * It contains the participant that is targeted by the request, 
 * i.e. the participant that should be removed from the course.  
 * This property is set by the following guards:
 * - `SelectedParticipantGuard`
 */
export const GetSelectedParticipant = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	return ctx.switchToHttp().getRequest().selectedParticipant;
});

/**
 * Retrieves the `group` property of the `request`.
 * This property is set by the following guards:  
 * - `GroupGuard`
 */
export const GetGroup = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	return ctx.switchToHttp().getRequest().group;
});

/**
 * Retrieves the `assignment` property of the `request`.
 * This property is set by the following guards:  
 * - `AssignmentGuard`
 */
export const GetAssignment = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	return ctx.switchToHttp().getRequest().assignment;
});
