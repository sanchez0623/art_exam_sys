export enum QuizStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export class QuizSession {
  id!: number;

  status!: QuizStatus;

  totalQuestions!: number;

  answeredCount!: number;

  correctCount!: number;

  questionIds!: number[];

  isScheduled!: boolean;

  createdAt!: Date;

  completedAt!: Date | null;
}
