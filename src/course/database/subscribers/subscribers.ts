import { EventSubscriber, EntitySubscriberInterface, InsertEvent, RemoveEvent } from "typeorm";
import { CourseUserRelation } from "../../../shared/entities/course-user-relation.entity";
import { UserGroupRelation } from "../../../shared/entities/user-group-relation.entity";

@EventSubscriber()
export class CourseUserRelationSubscriber implements EntitySubscriberInterface<CourseUserRelation> {
   listenTo() {
	   // Indicates that this subscriber only listens to CourseUserRelation events
	   return CourseUserRelation;
   }

   afterInsert(event: InsertEvent<CourseUserRelation>) {
		//console.log(`AFTER INSERTED: `, event.entity);
		// TODO: Set some flag, if course = java
   }
}

@EventSubscriber()
export class UserGroupRelationSubscriber implements EntitySubscriberInterface<UserGroupRelation> {
   listenTo() {
	   // Indicates that this subscriber only listens to CourseUserRelation events
	   return UserGroupRelation;
   }

   afterInsert(event: InsertEvent<UserGroupRelation>) {
		//console.log(`AFTER INSERTED: `, event.entity);
		// TODO: Set some flag, if course = java
   }
}
