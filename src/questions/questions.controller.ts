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
    return this.svc.findAll({
      period,
      difficulty: difficulty ? parseInt(difficulty, 10) : undefined,
      search,
    });
  }

  @Get('count')
  async count() {
    return { count: await this.svc.count() };
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const q = await this.svc.findOne(id);
    if (!q) throw new NotFoundException();
    return q;
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
