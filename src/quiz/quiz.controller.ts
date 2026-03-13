import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ArtPeriod } from '../questions/question.entity';
import { QuizService } from './quiz.service';

@Controller('api/quiz')
export class QuizController {
  constructor(private readonly svc: QuizService) {}

  @Post('start')
  async start(
    @Body()
    body?: {
      count?: number;
      period?: ArtPeriod;
      difficulty?: number;
    },
  ) {
    return this.svc.startSession(body);
  }

  @Get('sessions')
  async sessions(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.listSessions(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('stats')
  async stats() {
    return this.svc.getStats();
  }

  @Get(':id')
  async getSession(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getSessionWithQuestions(id);
  }

  @Post(':id/answer')
  async answer(
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() body: { questionId: number; answer: string },
  ) {
    return this.svc.submitAnswer(sessionId, body.questionId, body.answer);
  }

  @Post(':id/complete')
  async complete(@Param('id', ParseIntPipe) id: number) {
    return this.svc.completeSession(id);
  }
}
