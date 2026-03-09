import { Injectable } from '@nestjs/common';
import { ArtPeriod, Question, QuestionType } from './question.entity';
import { SupabaseService } from '../supabase/supabase.service';

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
  private readonly tableName = 'exam_questions';

  constructor(private readonly supabaseService: SupabaseService) {}

  private mapQuestion(row: Record<string, unknown>): Question {
    return {
      id: Number(row.id),
      content: String(row.content),
      imageUrl: row.image_url ? String(row.image_url) : null,
      options: Array.isArray(row.options)
        ? row.options.map((option) => String(option))
        : [],
      answer: String(row.answer),
      explanation: String(row.explanation),
      type: (row.type as QuestionType) ?? QuestionType.SINGLE_CHOICE,
      period: (row.period as ArtPeriod) ?? ArtPeriod.MODERN,
      source: row.source ? String(row.source) : null,
      difficulty: Number(row.difficulty ?? 1),
      tags: row.tags ? String(row.tags) : null,
      createdAt: new Date(String(row.created_at)),
      updatedAt: new Date(String(row.updated_at)),
    };
  }

  private toInsertPayload(dto: CreateQuestionDto) {
    return {
      content: dto.content,
      image_url: dto.imageUrl ?? null,
      options: dto.options,
      answer: dto.answer,
      explanation: dto.explanation,
      type: dto.type ?? QuestionType.SINGLE_CHOICE,
      period: dto.period ?? ArtPeriod.MODERN,
      source: dto.source ?? null,
      difficulty: dto.difficulty ?? 1,
      tags: dto.tags ?? null,
    };
  }

  async findAll(filters?: {
    period?: ArtPeriod;
    difficulty?: number;
    search?: string;
  }): Promise<Question[]> {
    let query = this.supabaseService.client
      .from(this.tableName)
      .select('*')
      .order('id', { ascending: true });

    if (filters?.period) {
      query = query.eq('period', filters.period);
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.search) {
      query = query.ilike('content', `%${filters.search}%`);
    }

    const { data, error } = await query;
    this.supabaseService.throwIfError(error, this.tableName);
    return (data ?? []).map((row) => this.mapQuestion(row));
  }

  async findOne(id: number): Promise<Question | null> {
    const { data, error } = await this.supabaseService.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    this.supabaseService.throwIfError(error, this.tableName);
    return data ? this.mapQuestion(data) : null;
  }

  async count(): Promise<number> {
    const { count, error } = await this.supabaseService.client
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    this.supabaseService.throwIfError(error, this.tableName);
    return count ?? 0;
  }

  async create(dto: CreateQuestionDto): Promise<Question> {
    const { data, error } = await this.supabaseService.client
      .from(this.tableName)
      .insert(this.toInsertPayload(dto))
      .select('*')
      .single();

    this.supabaseService.throwIfError(error, this.tableName);
    return this.mapQuestion(data);
  }

  async remove(id: number): Promise<void> {
    const { error } = await this.supabaseService.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    this.supabaseService.throwIfError(error, this.tableName);
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
      const { data: existing, error } = await this.supabaseService.client
        .from(this.tableName)
        .select('id')
        .eq('content', dto.content)
        .maybeSingle();

      this.supabaseService.throwIfError(error, this.tableName);
      if (!existing) {
        await this.create(dto);
        count++;
      }
    }
    return count;
  }

  async findByContents(contents: string[]): Promise<Question[]> {
    if (contents.length === 0) {
      return [];
    }

    const results: Question[] = [];
    const chunkSize = 5;

    for (let index = 0; index < contents.length; index += chunkSize) {
      const chunk = contents.slice(index, index + chunkSize);
      const { data, error } = await this.supabaseService.client
        .from(this.tableName)
        .select('*')
        .in('content', chunk);

      this.supabaseService.throwIfError(error, this.tableName);
      results.push(...(data ?? []).map((row) => this.mapQuestion(row)));
    }

    return results;
  }

  async getContentIdMap(): Promise<Map<string, number>> {
    const { data, error } = await this.supabaseService.client
      .from(this.tableName)
      .select('id, content');

    this.supabaseService.throwIfError(error, this.tableName);
    return new Map(
      (data ?? []).map((row) => [String(row.content), Number(row.id)]),
    );
  }
}
