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

export class Question {
  id!: number;

  content!: string;

  imageUrl!: string | null;

  options!: string[];

  answer!: string;

  explanation!: string;

  type!: QuestionType;

  period!: ArtPeriod;

  source!: string | null;

  difficulty!: number;

  tags!: string | null;

  createdAt!: Date;

  updatedAt!: Date;
}
