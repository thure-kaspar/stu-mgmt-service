import { ArgumentsHost, Catch, ExceptionFilter, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { Request, Response } from "express";

/**
 * Catches EntityNotFoundErrors (thrown by typeorm's "findOneOrFail"-method) and sets response status to 404.
 * The "findOneOrFail"-method should be used whenever we expect the repository to return an entity.
 * Not catching this error would lead to the return of a 500-error (Internal server error), which would not
 * tell the client why his request failed.
 */
@Catch(UnauthorizedException, ForbiddenException)
export class UnauthorizedFilter implements ExceptionFilter {
	catch(exception: UnauthorizedException | ForbiddenException, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		response
			.status(exception.getStatus())
			.json({
				statusCode: exception.getStatus(),
				error: "Unauthorized",
				message: exception.message,
				path: request.url,
				params: request.params,
				headers: request.headers,
			});
	}
}
