import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../questions/question.entity';
import { QuizSession } from './quiz-session.entity';

@Entity('quiz_answers')
export class QuizAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QuizSession, (s) => s.answers, { onDelete: 'CASCADE' })
  session: QuizSession;

  @Column()
  sessionId: number;

  @ManyToOne(() => Question, (q) => q.quizAnswers, { onDelete: 'CASCADE' })
  question: Question;

  @Column()
  questionId: number;

  @Column({ type: 'text', nullable: true })
  userAnswer: string; // option index(es) chosen

  @Column({ type: 'boolean', default: false })
  isCorrect: boolean;

  @CreateDateColumn()
  answeredAt: Date;
}
