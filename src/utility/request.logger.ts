import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { tap } from  "rxjs/operators";
import { Observable } from "rxjs";

/**
 * Interceptor that logs incoming requests and the corresponding response. 
 * Includes the request body, url, params and queries, as well as the status code and body of the response.
 * Enables app-wide logging when registered as APP_INTERCEPTOR in the providers of app.module.ts.
 * Should not be used in production.
 */
@Injectable()
export class RequestLogger implements NestInterceptor {
	
	private readonly logger = new Logger("RequestLogger");

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		// Collect relevant data from request / response
		const { originalUrl, method, params, query, body } = context.switchToHttp().getRequest();
		const { statusCode } = context.switchToHttp().getResponse();

		// Log information of incoming request
		this.logger.verbose({ originalUrl, method, params, query, body });

		// Handle (exectute) the request and log its response 
		return next.handle().pipe(tap(data => this.logger.verbose({ statusCode, data })));
	}
}