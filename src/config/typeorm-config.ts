import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Course } from 'src/shared/entities/course.entity';
import { User } from 'src/shared/entities/user.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'StudentMgmtDb_Local',
  entities: [Course, User],
  synchronize: true,
};