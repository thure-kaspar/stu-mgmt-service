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
		// Values is of type array: Filter and return all values that actually exist in the enum.
		return values.filter(value => Object.values(target).includes(value));
	} else {
		if (Object.values(target).includes(values as any)) {
			// Values is just a value (not array), which exists in enum: Return as array
			return [values];
		} else {
			return undefined;
		}
	}
}

/**
 * Returns the boolean value of a string. Incoming data over HTTP is always a string,
 * therefore we must transform "true" -> true and "false" -> false.
 * If the given value is ```null``` or ```undefined```, returns ```undefined```.  
 * If the given value is already a number, returns the boolean.
 * If the app is using the ```ValidationPipe``` with ```transform``` enabled,
 * calling this function is only necessary for nested properties of Query-Objects.
 */
export function transformBoolean(bool: unknown): boolean | undefined {
	if (!bool) return undefined;

	if (typeof bool == "boolean") return bool;

	if (bool === "true") return true;
	if (bool === "false") return false;
}

/**
 * Returns the numeric value of a string. 
 * If the given value is ```null``` or ```undefined```, returns ```undefined```.
 * If the given value is already a number, returns the value.
 */
export function transformNumber(value: unknown): number | undefined {
	if (!value) return undefined;

	if (typeof value === "number") return value;
	if (typeof value === "string") return parseFloat(value);
}
