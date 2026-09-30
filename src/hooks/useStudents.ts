import { useCallback, useEffect, useState } from "react";
import type { Student } from "../types";
import { uid } from "../utils/grading";

const STORAGE_KEY = "grade-calculator:students:v1";

function make(
  name: string,
  roll: string,
  className: string,
  marks: [number, number, number, number, number]
): Student {
  const subjects = ["Mathematics", "Science", "English", "History", "Computer Science"];
  return {
    id: uid(),
    name,
    roll,
    className,
    createdAt: Date.now(),
    subjects: subjects.map((s, i) => ({ id: uid(), name: s, marks: marks[i] })),
  };
}

export function sampleStudents(): Student[] {
  return [
    make("Aarav Sharma", "101", "10-A", [96, 92, 88, 91, 98]),
    make("Meera Iyer", "102", "10-A", [84, 79, 90, 76, 88]),
    make("Rohan Verma", "103", "10-B", [72, 68, 75, 64, 81]),
    make("Sana Khan", "104", "10-B", [58, 62, 55, 66, 60]),
    make("Dev Patel", "105", "10-A", [45, 48, 52, 41, 50]),
    make("Isha Nair", "106", "10-C", [35, 28, 42, 30, 38]),
  ];
}

function load(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Student[];
    }
  } catch {
    /* ignore corrupt storage */
  }
  return sampleStudents();
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch {
      /* storage unavailable */
    }
  }, [students]);

  const addStudent = useCallback((data: Omit<Student, "id" | "createdAt">) => {
    setStudents((prev) => [{ ...data, id: uid(), createdAt: Date.now() }, ...prev]);
  }, []);

  const updateStudent = useCallback((id: string, data: Omit<Student, "id" | "createdAt">) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const loadSamples = useCallback(() => setStudents(sampleStudents()), []);
  const clearAll = useCallback(() => setStudents([]), []);

  return { students, addStudent, updateStudent, deleteStudent, loadSamples, clearAll };
}
