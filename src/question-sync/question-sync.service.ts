import { Injectable, Logger } from '@nestjs/common';
import { load } from 'cheerio';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { ArtPeriod, QuestionType } from '../questions/question.entity';
import { CreateQuestionDto, QuestionsService } from '../questions/questions.service';

type SourceType = 'html' | 'json';

type BaseSourceConfig = {
  name: string;
  type: SourceType;
  url: string;
  latestFirst?: boolean;
  maxItems?: number;
  headers?: Record<string, string>;
  period?: ArtPeriod | string;
  difficulty?: number | string;
  tags?: string[] | string;
  sourceSite?: string;
};

type HtmlFieldSelectors = {
  contentSelector: string;
  optionsSelector: string;
  answerSelector: string;
  explanationSelector?: string;
  imageSelector?: string;
  publishedAtSelector?: string;
  periodSelector?: string;
  difficultySelector?: string;
  tagsSelector?: string;
};

type HtmlSourceConfig = BaseSourceConfig & {
  type: 'html';
  itemSelector?: string;
  detailLinkSelector?: string;
  detailLinkAttribute?: string;
  fields: HtmlFieldSelectors;
};

type JsonFieldMap = {
  content: string;
  options: string;
  answer: string;
  explanation?: string;
  imageUrl?: string;
  publishedAt?: string;
  period?: string;
  difficulty?: string;
  tags?: string;
  sourceUrl?: string;
};

type JsonSourceConfig = BaseSourceConfig & {
  type: 'json';
  listPath?: string;
  fields: JsonFieldMap;
};

type QuestionSourceConfig = HtmlSourceConfig | JsonSourceConfig;

type ExtractedQuestion = {
  content: string;
  options: string[];
  answer: string | number | Array<string | number>;
  explanation?: string;
  imageUrl?: string;
  publishedAt?: string;
  period?: string;
  difficulty?: string | number;
  tags?: string | string[];
  sourceUrl?: string;
};

type SourceSyncSummary = {
  name: string;
  fetchedCount: number;
  acceptedCount: number;
  duplicateCount: number;
  error?: string;
};

export type QuestionSyncSummary = {
  requestedCount: number;
  fetchedCount: number;
  insertedCount: number;
  duplicateCount: number;
  sourceSummaries: SourceSyncSummary[];
  warnings: string[];
};

@Injectable()
export class QuestionSyncService {
  private readonly logger = new Logger(QuestionSyncService.name);

  private readonly defaultConfigPath =
    process.env.EXAM_QUESTION_SOURCES_PATH ??
    join(process.cwd(), 'data', 'question-sync-sources.json');

  constructor(private readonly questionsService: QuestionsService) {}

  async syncLatestQuestions(requestedCount = 10): Promise<QuestionSyncSummary> {
    const warnings: string[] = [];
    const sourceConfigs = this.loadSourceConfigs();

    if (sourceConfigs.length === 0) {
      const warning =
        '未检测到题源配置，请创建 data/question-sync-sources.json 或设置 EXAM_QUESTION_SOURCES_JSON。';
      this.logger.warn(warning);
      return {
        requestedCount,
        fetchedCount: 0,
        insertedCount: 0,
        duplicateCount: 0,
        sourceSummaries: [],
        warnings: [warning],
      };
    }

    const existingHashes = await this.questionsService.getContentHashSet();
    const seenInRun = new Set<string>();
    const collected: CreateQuestionDto[] = [];
    const sourceSummaries: SourceSyncSummary[] = [];
    let duplicateCount = 0;

    for (const source of sourceConfigs) {
      if (collected.length >= requestedCount) {
        break;
      }

      try {
        const extractedQuestions = await this.fetchSourceQuestions(source);
        let acceptedCount = 0;
        let sourceDuplicates = 0;

        for (const extractedQuestion of extractedQuestions) {
          if (collected.length >= requestedCount) {
            break;
          }

          const dto = this.toCreateQuestionDto(extractedQuestion, source);
          if (!dto) {
            continue;
          }

          const contentHash = dto.contentHash ?? this.questionsService.buildContentHash(dto.content);
          if (existingHashes.has(contentHash) || seenInRun.has(contentHash)) {
            sourceDuplicates += 1;
            duplicateCount += 1;
            continue;
          }

          seenInRun.add(contentHash);
          collected.push({
            ...dto,
            contentHash,
          });
          acceptedCount += 1;
        }

        sourceSummaries.push({
          name: source.name,
          fetchedCount: extractedQuestions.length,
          acceptedCount,
          duplicateCount: sourceDuplicates,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`题源 ${source.name} 同步失败: ${message}`);
        sourceSummaries.push({
          name: source.name,
          fetchedCount: 0,
          acceptedCount: 0,
          duplicateCount: 0,
          error: message,
        });
      }
    }

    if (collected.length < requestedCount) {
      warnings.push(`本次仅采集到 ${collected.length} 道可入库新题，低于目标 ${requestedCount} 道。`);
    }

    const insertedCount = await this.questionsService.bulkUpsert(collected.slice(0, requestedCount));
    return {
      requestedCount,
      fetchedCount: collected.length,
      insertedCount,
      duplicateCount,
      sourceSummaries,
      warnings,
    };
  }

  private loadSourceConfigs(): QuestionSourceConfig[] {
    const jsonFromEnv = process.env.EXAM_QUESTION_SOURCES_JSON;
    if (jsonFromEnv) {
      return this.parseSourceConfigJson(jsonFromEnv, 'EXAM_QUESTION_SOURCES_JSON');
    }

    if (!existsSync(this.defaultConfigPath)) {
      return [];
    }

    const fileContent = readFileSync(this.defaultConfigPath, 'utf8');
    return this.parseSourceConfigJson(fileContent, this.defaultConfigPath);
  }

  private parseSourceConfigJson(content: string, sourceName: string): QuestionSourceConfig[] {
    try {
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        this.logger.warn(`${sourceName} 不是数组，已忽略。`);
        return [];
      }
      return parsed as QuestionSourceConfig[];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`解析题源配置失败 (${sourceName}): ${message}`);
      return [];
    }
  }

  private async fetchSourceQuestions(source: QuestionSourceConfig): Promise<ExtractedQuestion[]> {
    if (source.type === 'json') {
      return this.fetchJsonSourceQuestions(source);
    }
    return this.fetchHtmlSourceQuestions(source);
  }

  private async fetchJsonSourceQuestions(source: JsonSourceConfig): Promise<ExtractedQuestion[]> {
    const response = await fetch(source.url, {
      headers: source.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as Record<string, unknown>;
    const items = this.getValueByPath(json, source.listPath) ?? json;
    if (!Array.isArray(items)) {
      throw new Error('JSON 题源未返回数组数据');
    }

    return this.limitItems(
      items.map((item) => this.mapJsonItemToQuestion(item as Record<string, unknown>, source)),
      source.maxItems,
      source.latestFirst,
    ).filter((item): item is ExtractedQuestion => Boolean(item));
  }

  private mapJsonItemToQuestion(
    item: Record<string, unknown>,
    source: JsonSourceConfig,
  ): ExtractedQuestion | null {
    const optionsValue = this.getValueByPath(item, source.fields.options);
    const options = Array.isArray(optionsValue)
      ? optionsValue.map((option) => this.normalizeText(String(option)))
      : String(optionsValue ?? '')
          .split(/\r?\n|\|/)
          .map((option) => this.normalizeText(option))
          .filter(Boolean);

    return {
      content: this.normalizeText(String(this.getValueByPath(item, source.fields.content) ?? '')),
      options,
      answer: (this.getValueByPath(item, source.fields.answer) ?? '') as string | number | Array<string | number>,
      explanation: this.normalizeText(
        String(this.getValueByPath(item, source.fields.explanation) ?? ''),
      ),
      imageUrl: this.normalizeText(String(this.getValueByPath(item, source.fields.imageUrl) ?? '')) || undefined,
      publishedAt:
        this.normalizeText(String(this.getValueByPath(item, source.fields.publishedAt) ?? '')) || undefined,
      period: this.normalizeText(String(this.getValueByPath(item, source.fields.period) ?? '')) || undefined,
      difficulty:
        (this.getValueByPath(item, source.fields.difficulty) as string | number | undefined) ?? undefined,
      tags: (this.getValueByPath(item, source.fields.tags) as string | string[] | undefined) ?? undefined,
      sourceUrl:
        this.normalizeText(String(this.getValueByPath(item, source.fields.sourceUrl) ?? '')) || source.url,
    };
  }

  private async fetchHtmlSourceQuestions(source: HtmlSourceConfig): Promise<ExtractedQuestion[]> {
    const response = await fetch(source.url, {
      headers: source.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);

    if (source.detailLinkSelector) {
      const linkAttribute = source.detailLinkAttribute ?? 'href';
      const links = $(source.detailLinkSelector)
        .map((_, element) => $(element).attr(linkAttribute))
        .get()
        .map((href) => this.resolveUrl(source.url, href))
        .filter((href): href is string => Boolean(href));

      const limitedLinks = this.limitItems(links, source.maxItems, source.latestFirst);
      const questions: ExtractedQuestion[] = [];
      for (const link of limitedLinks) {
        const detailResponse = await fetch(link, {
          headers: source.headers,
        });

        if (!detailResponse.ok) {
          this.logger.warn(`跳过无法访问的题目详情页: ${link}`);
          continue;
        }

        const detailHtml = await detailResponse.text();
        const detail$ = load(detailHtml);
        const extracted = this.extractHtmlQuestion(detail$, detail$.root(), source.fields, link);
        if (extracted) {
          questions.push(extracted);
        }
      }
      return questions;
    }

    const itemRoots = source.itemSelector ? $(source.itemSelector).toArray() : [$.root().get(0)];
    const limitedRoots = this.limitItems(itemRoots, source.maxItems, source.latestFirst);
    return limitedRoots
      .map((root) => this.extractHtmlQuestion($, $(root), source.fields, source.url))
      .filter((item): item is ExtractedQuestion => Boolean(item));
  }

  private extractHtmlQuestion(
    $: ReturnType<typeof load>,
    root: ReturnType<ReturnType<typeof load>>,
    fields: HtmlFieldSelectors,
    sourceUrl: string,
  ): ExtractedQuestion | null {
    const content = this.normalizeText(root.find(fields.contentSelector).first().text());
    const options = root
      .find(fields.optionsSelector)
      .map((_, element) => this.normalizeText($(element).text()))
      .get()
      .filter(Boolean);
    const answer = this.normalizeText(root.find(fields.answerSelector).first().text());

    if (!content || options.length < 2 || !answer) {
      return null;
    }

    return {
      content,
      options,
      answer,
      explanation: this.normalizeText(root.find(fields.explanationSelector ?? '').first().text()) || undefined,
      imageUrl:
        fields.imageSelector
          ? this.resolveUrl(sourceUrl, root.find(fields.imageSelector).first().attr('src'))
          : undefined,
      publishedAt:
        this.normalizeText(root.find(fields.publishedAtSelector ?? '').first().text()) || undefined,
      period: this.normalizeText(root.find(fields.periodSelector ?? '').first().text()) || undefined,
      difficulty:
        this.normalizeText(root.find(fields.difficultySelector ?? '').first().text()) || undefined,
      tags: this.normalizeText(root.find(fields.tagsSelector ?? '').first().text()) || undefined,
      sourceUrl,
    };
  }

  private toCreateQuestionDto(
    extractedQuestion: ExtractedQuestion,
    source: QuestionSourceConfig,
  ): CreateQuestionDto | null {
    const content = this.normalizeText(extractedQuestion.content);
    const options = extractedQuestion.options
      .map((option) => this.normalizeText(option))
      .filter(Boolean);

    if (!content || options.length < 2) {
      return null;
    }

    const answer = this.resolveAnswerIndices(extractedQuestion.answer, options);
    if (!answer) {
      this.logger.warn(`题目答案解析失败，已跳过：${content}`);
      return null;
    }

    const explanation =
      this.normalizeText(extractedQuestion.explanation ?? '') || '题目来自外部题源，建议结合原文进一步核对。';
    const difficulty = this.resolveDifficulty(extractedQuestion.difficulty ?? source.difficulty);
    const period = this.resolvePeriod(extractedQuestion.period ?? source.period);
    const tags = this.resolveTags(extractedQuestion.tags ?? source.tags);
    const type = this.resolveQuestionType(answer, options);

    return {
      content,
      options,
      answer,
      explanation,
      type,
      period,
      difficulty,
      tags,
      imageUrl: extractedQuestion.imageUrl,
      source: source.sourceSite ?? source.name,
      sourceSite: source.sourceSite ?? source.name,
      sourceUrl: extractedQuestion.sourceUrl ?? source.url,
      sourcePublishedAt: this.resolvePublishedAt(extractedQuestion.publishedAt),
      contentHash: this.questionsService.buildContentHash(content),
    };
  }

  private resolveAnswerIndices(
    rawAnswer: string | number | Array<string | number>,
    options: string[],
  ): string | null {
    const answerParts = Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer];
    const indices = answerParts
      .flatMap((part) => String(part).split(/[;,，、]/))
      .map((part) => this.normalizeText(part))
      .filter(Boolean)
      .map((part) => this.resolveSingleAnswerIndex(part, options))
      .filter((value): value is number => Number.isInteger(value));

    if (indices.length === 0) {
      return null;
    }

    return [...new Set(indices)].sort((left, right) => left - right).join(',');
  }

  private resolveSingleAnswerIndex(answerPart: string, options: string[]): number | null {
    if (/^\d+$/.test(answerPart)) {
      const numeric = Number(answerPart);
      if (numeric >= 0 && numeric < options.length) {
        return numeric;
      }
      if (numeric >= 1 && numeric <= options.length) {
        return numeric - 1;
      }
    }

    const letterMatch = answerPart.match(/[A-F]/i);
    if (letterMatch) {
      const letterIndex = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
      if (letterIndex >= 0 && letterIndex < options.length) {
        return letterIndex;
      }
    }

    const normalizedAnswer = answerPart.replace(/^正确答案[:：]?/i, '').trim();
    const optionIndex = options.findIndex(
      (option) => this.normalizeText(option).toLowerCase() === normalizedAnswer.toLowerCase(),
    );
    if (optionIndex >= 0) {
      return optionIndex;
    }

    const booleanAliases: Record<string, string[]> = {
      true: ['true', '对', '正确', '是'],
      false: ['false', '错', '错误', '否'],
    };
    for (const [target, aliases] of Object.entries(booleanAliases)) {
      if (!aliases.includes(normalizedAnswer.toLowerCase())) {
        continue;
      }

      const matchedIndex = options.findIndex((option) => {
        const normalizedOption = this.normalizeText(option).toLowerCase();
        return booleanAliases[target].includes(normalizedOption);
      });
      if (matchedIndex >= 0) {
        return matchedIndex;
      }
    }

    return null;
  }

  private resolveQuestionType(answer: string, options: string[]): QuestionType {
    if (answer.includes(',')) {
      return QuestionType.MULTIPLE_CHOICE;
    }

    if (
      options.length === 2 &&
      options.every((option) => ['true', 'false', '对', '错', '正确', '错误', '是', '否'].includes(this.normalizeText(option).toLowerCase()))
    ) {
      return QuestionType.TRUE_FALSE;
    }

    return QuestionType.SINGLE_CHOICE;
  }

  private resolvePeriod(value: string | ArtPeriod | undefined): ArtPeriod {
    const normalized = this.normalizeText(String(value ?? '')).toLowerCase();
    const periodMap: Record<string, ArtPeriod> = {
      ancient: ArtPeriod.ANCIENT,
      '古代': ArtPeriod.ANCIENT,
      medieval: ArtPeriod.MEDIEVAL,
      '中世纪': ArtPeriod.MEDIEVAL,
      renaissance: ArtPeriod.RENAISSANCE,
      '文艺复兴': ArtPeriod.RENAISSANCE,
      baroque: ArtPeriod.BAROQUE,
      rococo: ArtPeriod.BAROQUE,
      '巴洛克': ArtPeriod.BAROQUE,
      '洛可可': ArtPeriod.BAROQUE,
      modern: ArtPeriod.MODERN,
      '现代': ArtPeriod.MODERN,
      contemporary: ArtPeriod.CONTEMPORARY,
      '当代': ArtPeriod.CONTEMPORARY,
      non_western: ArtPeriod.NON_WESTERN,
      '非西方': ArtPeriod.NON_WESTERN,
    };

    return periodMap[normalized] ?? ArtPeriod.MODERN;
  }

  private resolveDifficulty(value: string | number | undefined): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.max(1, Math.min(3, Math.round(value)));
    }

    const normalized = this.normalizeText(String(value ?? ''));
    const numericMatch = normalized.match(/\d+/);
    if (numericMatch) {
      return Math.max(1, Math.min(3, Number(numericMatch[0])));
    }

    if (/hard|困难|challenging/i.test(normalized)) {
      return 3;
    }
    if (/medium|中等|intermediate/i.test(normalized)) {
      return 2;
    }
    return 1;
  }

  private resolveTags(value: string | string[] | undefined): string | undefined {
    if (!value) {
      return undefined;
    }

    const items = Array.isArray(value)
      ? value
      : String(value)
          .split(/[;,，、|]/)
          .map((item) => this.normalizeText(item));

    const tags = [...new Set(items.filter(Boolean))];
    return tags.length > 0 ? tags.join(',') : undefined;
  }

  private resolvePublishedAt(value: string | undefined): string | undefined {
    if (!value) {
      return undefined;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  private getValueByPath(payload: Record<string, unknown>, path?: string): unknown {
    if (!path) {
      return undefined;
    }

    return path.split('.').reduce<unknown>((current, key) => {
      if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, payload);
  }

  private normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  private resolveUrl(baseUrl: string, href?: string | null): string | undefined {
    if (!href) {
      return undefined;
    }

    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return undefined;
    }
  }

  private limitItems<T>(items: T[], maxItems?: number, latestFirst = true): T[] {
    const normalizedItems = latestFirst ? items : [...items].reverse();
    if (!maxItems || maxItems <= 0) {
      return normalizedItems;
    }
    return normalizedItems.slice(0, maxItems);
  }
}
