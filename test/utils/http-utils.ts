import { Request } from "express";

/**
 * Sets the ```X-TOTAL-COUNT``` header of the response message.
 * Clients can use the header to implement pagination.
 * @param response
 * @param count
 */
export function setTotalCountHeader(request: Request, count: number): void {
	request.res.setHeader("x-total-count", count);
}

/**
 * Sanitizes enum values coming from a query string.
 * Returns an array of valid values or undefined, if no valid values were found.
 * @param target The enum that the given values belong to.
 * @param values Values from the query string.
 */
export function sanitizeEnum<Enum>(target: Enum, values: any[]): any[] | undefined {
	if (!values) return undefined;
	
	if (Array.isArray(values as any)) {
		return values.filter(value => Object.values(target).includes(value));
	} else {
		if (Object.values(target).includes(values as any)) {
			return [values];
		} else {
			return undefined;
		}
	}
}
