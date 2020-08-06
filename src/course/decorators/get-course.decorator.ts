import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Retrieves the `course` property of the `request`.
 * This property is set by the following guards:
 * - `CourseMemberGuard`. 
 */
export const GetCourse = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	return request.course;
});
