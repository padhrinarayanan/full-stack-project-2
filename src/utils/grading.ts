import type { GradeLetter, Result, Student, SubjectMark } from "../types";

export const MAX_MARKS = 100;
export const PASS_MARK = 40;

export const GRADE_SCALE: {
  grade: GradeLetter;
  min: number;
  max: number;
  remark: string;
}[] = [
  { grade: "A+", min: 90, max: 100, remark: "Outstanding" },
  { grade: "A", min: 80, max: 89.99, remark: "Excellent" },
  { grade: "B", min: 70, max: 79.99, remark: "Very good" },
  { grade: "C", min: 60, max: 69.99, remark: "Good" },
  { grade: "D", min: 50, max: 59.99, remark: "Satisfactory" },
  { grade: "E", min: 40, max: 49.99, remark: "Pass" },
  { grade: "F", min: 0, max: 39.99, remark: "Needs improvement" },
];

export const GRADE_ORDER: GradeLetter[] = GRADE_SCALE.map((g) => g.grade);

export const DEFAULT_SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Computer Science",
];

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function getGrade(average: number): { grade: GradeLetter; remark: string } {
  const found = GRADE_SCALE.find((g) => average >= g.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1];
  return { grade: found.grade, remark: found.remark };
}

export function calculate(subjects: Pick<SubjectMark, "marks">[]): Result {
  const total = subjects.reduce((sum, s) => sum + (Number.isFinite(s.marks) ? s.marks : 0), 0);
  const max = subjects.length * MAX_MARKS;
  const average = subjects.length ? total / subjects.length : 0;
  const { grade, remark } = getGrade(average);
  return { total, max, average, grade, remark, passed: grade !== "F" };
}

export function resultOf(student: Student): Result {
  return calculate(student.subjects);
}

export function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export interface FormErrors {
  name?: string;
  roll?: string;
  className?: string;
  subjects: Record<string, { name?: string; marks?: string }>;
  general?: string;
}

export interface FormRow {
  id: string;
  name: string;
  marks: string;
}

export function validateStudentForm(
  values: { name: string; roll: string; className: string; rows: FormRow[] },
  others: Student[]
): FormErrors {
  const errors: FormErrors = { subjects: {} };

  const name = values.name.trim();
  if (!name) errors.name = "Student name is required.";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters.";
  else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name))
    errors.name = "Use letters, spaces, apostrophes or hyphens only.";

  const roll = values.roll.trim();
  if (!roll) errors.roll = "Roll number is required.";
  else if (!/^[A-Za-z0-9-]{1,12}$/.test(roll))
    errors.roll = "Use up to 12 letters, digits or hyphens.";
  else if (others.some((s) => s.roll.toLowerCase() === roll.toLowerCase()))
    errors.roll = "This roll number already exists.";

  if (values.className.trim().length > 20) errors.className = "Keep the class under 20 characters.";

  if (values.rows.length === 0) errors.general = "Add at least one subject.";

  const seen = new Set<string>();
  values.rows.forEach((row) => {
    const rowErr: { name?: string; marks?: string } = {};
    const subject = row.name.trim();
    if (!subject) rowErr.name = "Subject name required.";
    else if (seen.has(subject.toLowerCase())) rowErr.name = "Duplicate subject.";
    seen.add(subject.toLowerCase());

    const raw = row.marks.trim();
    if (raw === "") rowErr.marks = "Enter marks.";
    else if (Number.isNaN(Number(raw))) rowErr.marks = "Must be a number.";
    else if (Number(raw) < 0 || Number(raw) > MAX_MARKS) rowErr.marks = `Between 0 and ${MAX_MARKS}.`;

    if (rowErr.name || rowErr.marks) errors.subjects[row.id] = rowErr;
  });

  return errors;
}

export function hasErrors(e: FormErrors): boolean {
  return Boolean(e.name || e.roll || e.className || e.general || Object.keys(e.subjects).length);
}
