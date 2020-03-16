import { Repository, EntityRepository } from "typeorm";
import { UpdateMessage } from "../entities/update-message.entity";

@EntityRepository(UpdateMessage)
export class UpdateMessageRepository extends Repository<UpdateMessage> {

}