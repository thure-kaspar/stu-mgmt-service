/** Classes implementing this interface implement `toDto(): RType`. */
export interface ToDto<RType> {
	/** Returns the dto representation of the entity. */
	toDto(): RType;
}

/** Returns the dto representation of the given entity. */
export function toDto<RType>(entity: ToDto<RType> | undefined): RType | undefined {
	return entity?.toDto();
}

/** Maps an array of dto-able entities to their dto representation. */
export function toDtos<RType>(entities: ToDto<RType>[] | undefined): RType[] | undefined {
	return entities?.map(e => e.toDto());
}
