import { Response } from "express";

/**
 * Sets the ```X-TOTAL-COUNT``` header of the response message.
 * Clients can use the header to implement pagination.
 * @param response
 * @param count
 */
export function setTotalCountHeader(response: Response, count: number): void {
	response.setHeader("X-TOTAL-COUNT", count);
}
