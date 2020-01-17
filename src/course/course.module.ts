import { Module } from '@nestjs/common';
import { CourseController } from './controllers/course.controller';
import { CourseService } from './services/course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseRepository } from './repositories/course-repository';
import { UserRepository } from 'src/user/repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CourseRepository, UserRepository])],
  controllers: [CourseController],
  providers: [CourseService]
})
export class CourseModule {}
