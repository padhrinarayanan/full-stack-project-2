export interface SubjectMark {
  id: string;
  name: string;
  marks: number;
}

export interface Student {
  id: string;
  name: string;
  roll: string;
  className: string;
  subjects: SubjectMark[];
  createdAt: number;
}

export type GradeLetter = "A+" | "A" | "B" | "C" | "D" | "E" | "F";

export interface Result {
  total: number;
  max: number;
  average: number;
  grade: GradeLetter;
  remark: string;
  passed: boolean;
}

export type ViewName = "dashboard" | "calculator" | "records" | "scale";
