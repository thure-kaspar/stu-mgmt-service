import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, Repository } from "typeorm";
import { UserGroupRelation } from "../../entities/user-group-relation.entity";
import { UpdateService } from "../../services/update.service";
import { EventType, UpdateMessage, AffectedObject } from "../../../shared/dto/update-message.dto";

@EventSubscriber()
export class UserGroupRelationSubscriber implements EntitySubscriberInterface<UserGroupRelation> {

	private updateService: UpdateService;

	constructor() {
		this.updateService = UpdateService.instance;
	}

	listenTo() {
		// Indicates that this subscriber only listens to UserGroupRelation events
		return UserGroupRelation;
	}

	async afterInsert(event: InsertEvent<UserGroupRelation>): Promise<void> {
		const reloadedEntity = await this.reloadEntityWithRequiredRelations(event.manager.getRepository(UserGroupRelation), event.entity); // Need to load group-relation in order to obtains courseId
		this.updateService.send(
			this.createMessage(EventType.INSERT, reloadedEntity)
		);
	}

	async afterUpdate(event: UpdateEvent<UserGroupRelation>): Promise<void> {
		const reloadedEntity = await this.reloadEntityWithRequiredRelations(event.manager.getRepository(UserGroupRelation), event.entity); // Need to load group-relation in order to obtains courseId
		this.updateService.send(
			this.createMessage(EventType.UPDATE, reloadedEntity)
		);
	}

	async afterRemove(event: RemoveEvent<UserGroupRelation>): Promise<void> {
		const reloadedEntity = await this.reloadEntityWithRequiredRelations(event.manager.getRepository(UserGroupRelation), event.entity); // Need to load group-relation in order to obtains courseId
		this.updateService.send(
			this.createMessage(EventType.REMOVE, reloadedEntity)
		);
	}

	/**
	 * Queries and loads the entity again in order to load necessary relations.
	 */
	private async reloadEntityWithRequiredRelations(repository: Repository<UserGroupRelation>, entity: UserGroupRelation): Promise<UserGroupRelation> {
		return repository.findOneOrFail(entity.id, {
			relations: ["group"]
		});
	} 

	/**
	 * Creates the update message from given EventType and entity data.
	 */
	private createMessage(type: EventType, entity: UserGroupRelation): UpdateMessage {
		return {
			type: type,
			affectedObject: AffectedObject.USER_GROUP_RELATION,
			courseId: entity.group.courseId,
			entityId: entity.userId,
			entityId_relation: entity.groupId
		};
	}
}
