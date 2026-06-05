export interface ProcedureStep {
  stepNumber: number;
  title: string;
  description: string;
  tip?: string;
}

export interface Procedure {
  _id: string;
  title: string;
  titleLocalized?: Record<string, string>;
  category: string;
  subcategory: string;
  steps: ProcedureStep[];
  stepsLocalized?: Record<string, ProcedureStep[]>;
  requiredDocs: string[];
  relatedLinks: { label: string; url: string }[];
  timeEstimate: string;
  difficulty: 'easy' | 'moderate' | 'complex';
  lastVerified: string;
  localizedTitle?: string;
}
