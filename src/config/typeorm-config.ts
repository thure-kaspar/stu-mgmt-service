import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Course } from 'src/shared/entities/course.entity';
import { User } from 'src/shared/entities/user.entity';
import * as config from "config"
import { CourseUserRelation } from '../shared/entities/course-user-relation.entity';
import { Group } from '../shared/entities/group.entity';
import { UserGroupRelation } from '../shared/entities/user-group-relation.entity';

const dbConfig = config.get("db");

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: process.env.DB_TYPE || dbConfig.type,
  host: process.env.DB_HOST || dbConfig.host,
  port: process.env.DB_PORT || dbConfig.port,
  username: process.env.DB_USERNAME || dbConfig.username,
  password: process.env.DB_PASSWORD || dbConfig.password,
  database: process.env.DB_DATABASE || dbConfig.database,
  synchronize: process.env.TYPEORM_SYNC || dbConfig.synchronize,
  entities: [Course, User, Group, CourseUserRelation, UserGroupRelation],
};
