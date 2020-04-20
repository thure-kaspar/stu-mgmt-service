import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { Request, Response } from "express";

/**
 * Catches EntityNotFoundErrors (thrown by typeorm's "findOneOrFail"-method) and sets response status to 404.
 * The "findOneOrFail"-method should be used whenever we expect the repository to return an entity.
 * Not catching this error would lead to the return of a 500-error (Internal server error), which would not
 * tell the client why his request failed.
 */
@Catch(EntityNotFoundError)
export class EntityNotFoundFilter implements ExceptionFilter {
	catch(exception: EntityNotFoundError, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		
		response
			.status(404)
			.json({
				statusCode: 404,
				path: request.url,
				message: "The requested resource was not found."
			});
	}
}
