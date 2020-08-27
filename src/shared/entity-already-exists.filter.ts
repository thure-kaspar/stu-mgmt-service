import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Request, Response } from "express";
import { EntityAlreadyExistsError } from "./database-exceptions";

/**
 * Catches `EntityAlreadyExistsError`.
 */
@Catch(EntityAlreadyExistsError)
export class EntityAlreadyExistsFilter implements ExceptionFilter {
	catch(exception: EntityAlreadyExistsError, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		
		response
			.status(409)
			.json({
				statusCode: 409,
				path: request.url,
				error: "EntityAlreadyExistsError",
				message: exception.message ?? "Failed to create the entity, because it already exists."
			});
	}
}
