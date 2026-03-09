import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ArtPeriod } from './question.entity';
import { CreateQuestionDto, QuestionsService } from './questions.service';

@Controller('api/questions')
export class QuestionsController {
  constructor(private readonly svc: QuestionsService) {}

  @Get()
  async list(
    @Query('period') period?: ArtPeriod,
    @Query('difficulty') difficulty?: string,
    @Query('search') search?: string,
  ) {
    const questions = await this.svc.findAll({
      period,
      difficulty: difficulty ? parseInt(difficulty, 10) : undefined,
      search,
    });
    return questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options) as string[],
    }));
  }

  @Get('count')
  async count() {
    return { count: await this.svc.count() };
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const q = await this.svc.findOne(id);
    if (!q) throw new NotFoundException();
    return { ...q, options: JSON.parse(q.options) as string[] };
  }

  @Post()
  async create(@Body() body: CreateQuestionDto) {
    return this.svc.create(body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.svc.remove(id);
  }
}
