import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {

	private startTime = new Date();

	constructor() { }

	@Get("uptime")
	getUptime(): any {
		return {
			startTime: this.startTime.toLocaleString(),
			uptime: this.timeConversion(new Date().getTime() - this.startTime.getTime())
		};
	}

	private timeConversion(difference: any): string {
		const seconds = (difference / 1000).toFixed(1) as any;
		const minutes = (difference / (1000 * 60)).toFixed(1) as any;
		const hours = (difference / (1000 * 60 * 60)).toFixed(1) as any;
		const days = (difference / (1000 * 60 * 60 * 24)).toFixed(1) as any;

		if (seconds < 60) {
			return seconds + " Sec";
		} else if (minutes < 60) {
			return minutes + " Min";
		} else if (hours < 24) {
			return hours + " Hrs";
		} else {
			return days + " Days";
		}
	}
}
