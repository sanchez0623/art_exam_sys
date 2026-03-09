import { Question } from '../questions/question.entity';
import { QuizSession } from './quiz-session.entity';

export class QuizAnswer {
  id!: number;

  session?: QuizSession;

  sessionId!: number;

  question?: Question;

  questionId!: number;

  userAnswer!: string | null;

  isCorrect!: boolean;

  answeredAt!: Date;
}
