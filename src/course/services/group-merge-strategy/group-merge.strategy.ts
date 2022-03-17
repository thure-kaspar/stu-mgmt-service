export type SimpleGroup = { id: string; members: { userId: string; groupId?: string }[] };

export abstract class GroupMergeStrategy {
	abstract merge(
		courseId: string,
		minSize: number,
		maxSize: number,
		groups: SimpleGroup[]
	): Promise<SimpleGroup[]>;
}
