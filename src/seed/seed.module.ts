import { Module } from '@nestjs/common';
import { QuestionsModule } from '../questions/questions.module';
import { SeedService } from './seed.service';

@Module({
  imports: [QuestionsModule],
  providers: [SeedService],
})
export class SeedModule {}
