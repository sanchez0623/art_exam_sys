import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtPeriod, Question, QuestionType } from './question.entity';

export class CreateQuestionDto {
  content: string;
  options: string[];
  answer: string;
  explanation: string;
  type?: QuestionType;
  period?: ArtPeriod;
  source?: string;
  difficulty?: number;
  tags?: string;
  imageUrl?: string;
}

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly repo: Repository<Question>,
  ) {}

  async findAll(filters?: {
    period?: ArtPeriod;
    difficulty?: number;
    search?: string;
  }): Promise<Question[]> {
    const qb = this.repo.createQueryBuilder('q');
    if (filters?.period) {
      qb.andWhere('q.period = :period', { period: filters.period });
    }
    if (filters?.difficulty) {
      qb.andWhere('q.difficulty = :diff', { diff: filters.difficulty });
    }
    if (filters?.search) {
      qb.andWhere('q.content LIKE :s', { s: `%${filters.search}%` });
    }
    return qb.orderBy('q.id', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Question | null> {
    return this.repo.findOneBy({ id });
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async create(dto: CreateQuestionDto): Promise<Question> {
    const q = this.repo.create({
      ...dto,
      options: JSON.stringify(dto.options),
    });
    return this.repo.save(q);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  /** Pick `count` random questions, optionally filtered */
  async getRandom(
    count: number,
    filters?: { period?: ArtPeriod; difficulty?: number },
  ): Promise<Question[]> {
    const all = await this.findAll(filters);
    // Fisher-Yates shuffle for unbiased randomization
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, Math.min(count, all.length));
  }

  /** Bulk upsert – used by seed and future question-bank fetch */
  async bulkUpsert(questions: CreateQuestionDto[]): Promise<number> {
    let count = 0;
    for (const dto of questions) {
      const existing = await this.repo.findOneBy({ content: dto.content });
      if (!existing) {
        await this.create(dto);
        count++;
      }
    }
    return count;
  }
}
