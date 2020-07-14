import { BaseEntity } from "typeorm";

/**
 * Returns a deep copy of the given object.
 */
export function copy<T>(target: T): T {
	if (target === null) {
		return target;
	}
	if (target instanceof Date) {
		return new Date(target.getTime()) as any;
	}
	// First part is for array and second part is for Realm.Collection
	// if (target instanceof Array || typeof (target as any).type === 'string') {
	if (typeof target === "object") {
		if (typeof target[(Symbol as any).iterator] === "function") {
			const cp = [] as any[];
			if ((target as any as any[]).length > 0) {
				for (const arrayMember of target as any as any[]) {
					cp.push(copy(arrayMember));
				}
			}
			return cp as any as T;
		} else {
			const targetKeys = Object.keys(target);
			const cp = {};
			if (targetKeys.length > 0) {
				for (const key of targetKeys) {
					cp[key] = copy(target[key]);
				}
			}
			return cp as T;
		}
	}
	// Means that object is atomic
	return target;
}

/** Assigns all properties of the source to the target-object. */
export function assignProperties(target: any, source: any): void {
	Object.keys(source).forEach(key=> {
		target[key] = source[key];
	});
}

/** Assigns only matching properties of the source to the target-object. Does not include nested. */
export function assignMatchingProperties(target: any, source: any): void {
	Object.keys(source).forEach(key=> {
		if (key in target) target[key] = source[key]; // TODO: Figure out a way to implement this so it works with entities
	});
}

/**
 * Creates an entity of the given type and assigns matching properties.
 * Will only work, if entity and dto share a similar structure. Will not perform any custom mapping between these objects.
 * Does not include nested objects such as relations.
 */
export function convertToEntityNoRelations<T>(target: (new () => T), dto: unknown): T {
	const entity = new target();
	assignProperties(entity, copy(dto)); // TODO: Using wrong method while assignMatchingProperties doesn't work
	return entity;
}

/**
 * Creates an entity of the given type and assigns all properties of the given Dto to it.
 * Will only work, if entity and dto share a similar structure. Will not perform any custom mapping between these objects.
 * Nested objects will be assigned, but not instantiated as entities.
 */
export function convertToEntity<T>(target: (new () => T), dto: unknown): T {
	const entity = new target();
	assignProperties(entity, copy(dto));
	return entity;
}

