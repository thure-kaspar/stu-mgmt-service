import * as excel from "exceljs";
import { Response } from "express";

export type Workbook = excel.Workbook;

export function createWorkbook<T>(data?: T[]): excel.Workbook {
	const workbook = new excel.Workbook();
	const worksheet = workbook.addWorksheet();

	if (data) {
		addHeaderRow(data, worksheet);
		worksheet.addRows(data);
	}

	return workbook;
}

export async function writeWorkbookToResponse(
	res: Response,
	workbook: excel.Workbook
): Promise<void> {
	await workbook.xlsx.write(res);
}

export function addHeaderRow<T>(flatData: T[], worksheet: excel.Worksheet): void {
	let objectWithMostKeys = flatData[0];
	let maxKeyCount = Object.keys(objectWithMostKeys).length;

	for (const data of flatData) {
		const keyCount = Object.keys(data).length;
		if (keyCount > maxKeyCount) {
			objectWithMostKeys = data;
			maxKeyCount = keyCount;
		}
	}

	worksheet.columns = Object.keys(objectWithMostKeys).map(key => ({
		header: key,
		key: key
	}));
}
