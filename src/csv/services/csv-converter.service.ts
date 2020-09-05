import { Injectable } from "@nestjs/common";
import * as flat from "flat";

@Injectable()
export class CsvConverterService {

	/**
	 * Transforms all entries in `T[]` to a flat object and returns a string of separated values
	 * using the given `separator`. Will determine all existing properties to create a header row.
	 */
	async flattenData<T>(promise: Promise<[T[], number]>, separator: string): Promise<string> {
		const [data] = await promise;
		
		// Create array of flat objects
		const flatData = data.map(entry => flat.flatten(entry));

		// Create array of all existing properties
		const properties = new Set<string>();
		flatData.forEach(flatObject => {
			Object.keys(flatObject).forEach(key => properties.add(key));
		});
		const keys = Array.from(properties.values());

		// Create header row
		const rows = [];
		rows.push(keys.join(separator));

		// Create entries
		flatData.forEach(flatObject => {
			const rowData = keys.map(key => flatObject[key]);
			rows.push(rowData.join(separator));
		});
		
		// Create a single string
		return rows.join("\n");
	} 

}
