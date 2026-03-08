import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdirSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface CountResponse {
  count: number;
}
interface StatsResponse {
  totalSessions: number;
  accuracy: number;
}
interface SessionResponse {
  id: number;
}
interface QuizDetailResponse {
  questions: { id: number }[];
}
interface AnswerResponse {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

describe('Quiz API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    mkdirSync(join(process.cwd(), 'data'), { recursive: true });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/questions/count (GET) should return question count', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/questions/count')
      .expect(200);
    const body = res.body as CountResponse;
    expect(body).toHaveProperty('count');
    expect(typeof body.count).toBe('number');
    expect(body.count).toBeGreaterThan(0);
  });

  it('/api/quiz/stats (GET) should return stats object', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/quiz/stats')
      .expect(200);
    const body = res.body as StatsResponse;
    expect(body).toHaveProperty('totalSessions');
    expect(body).toHaveProperty('accuracy');
  });

  it('/api/quiz/start (POST) then answer and complete', async () => {
    const startRes = await request(app.getHttpServer())
      .post('/api/quiz/start')
      .send({ count: 3 })
      .expect(201);
    const session = startRes.body as SessionResponse;
    const sessionId = session.id;
    expect(sessionId).toBeDefined();

    const sessionRes = await request(app.getHttpServer())
      .get(`/api/quiz/${sessionId}`)
      .expect(200);
    const detail = sessionRes.body as QuizDetailResponse;
    expect(detail.questions.length).toBe(3);

    const q = detail.questions[0];
    const answerRes = await request(app.getHttpServer())
      .post(`/api/quiz/${sessionId}/answer`)
      .send({ questionId: q.id, answer: '0' })
      .expect(201);
    const answerBody = answerRes.body as AnswerResponse;
    expect(answerBody).toHaveProperty('isCorrect');
    expect(answerBody).toHaveProperty('correctAnswer');
    expect(answerBody).toHaveProperty('explanation');

    await request(app.getHttpServer())
      .post(`/api/quiz/${sessionId}/complete`)
      .expect(201);
  });
});
