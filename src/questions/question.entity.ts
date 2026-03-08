import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuizAnswer } from '../quiz/quiz-answer.entity';

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
}

export enum ArtPeriod {
  ANCIENT = 'ancient',
  MEDIEVAL = 'medieval',
  RENAISSANCE = 'renaissance',
  BAROQUE = 'baroque',
  MODERN = 'modern',
  CONTEMPORARY = 'contemporary',
  NON_WESTERN = 'non_western',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'text' })
  options: string; // JSON array of option strings

  @Column({ type: 'text' })
  answer: string; // Correct option index(es), e.g. "0" or "0,2"

  @Column({ type: 'text' })
  explanation: string;

  @Column({ type: 'varchar', default: QuestionType.SINGLE_CHOICE })
  type: QuestionType;

  @Column({ type: 'varchar', default: ArtPeriod.MODERN })
  period: ArtPeriod;

  @Column({ type: 'varchar', nullable: true })
  source: string; // e.g. "Yale University Art History Exam 2019"

  @Column({ type: 'int', default: 1 })
  difficulty: number; // 1=easy, 2=medium, 3=hard

  @Column({ type: 'varchar', nullable: true })
  tags: string; // comma-separated tags

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => QuizAnswer, (a) => a.question)
  quizAnswers: QuizAnswer[];
}
