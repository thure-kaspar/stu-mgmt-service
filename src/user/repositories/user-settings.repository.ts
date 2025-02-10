import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { UserSettings } from "../entities/user-settings.entity";

@Injectable()
export class UserSettingsRepository extends Repository<UserSettings> {
    constructor(private dataSource: DataSource) {
        super(UserSettings, dataSource.createEntityManager());
      }
    }