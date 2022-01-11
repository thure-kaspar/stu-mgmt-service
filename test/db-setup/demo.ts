import { StudentMgmtDbData } from "../utils/demo-db";
import { ISUM_ONLY_CONFIG } from "./isum-only";
import { TESTING_CONFIG } from "./testing";

export const DEMO_CONFIG: StudentMgmtDbData = {
	users: [...TESTING_CONFIG.users, ...ISUM_ONLY_CONFIG.users],
	courses: [...TESTING_CONFIG.courses, ...ISUM_ONLY_CONFIG.courses]
};
