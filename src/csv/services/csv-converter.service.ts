import { Injectable } from "@nestjs/common";
import { parseAsync  } from "json2csv";

@Injectable()
export class CsvConverterService {

	/**
 	* Converts the given array of objects to a csv-string.
 	* If `fields` are specified, only the corresponding properties will be included.
 	* @param [properties] Array with properties of `T`.
 	*/
	parse<T extends object, K extends keyof T>(data: T[], properties?: readonly K[]): Promise<string> {
		return parseAsync(data, { fields: properties });
	}

}
