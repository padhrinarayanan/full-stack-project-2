import type { Student } from "../types";
import StudentForm from "../components/StudentForm";

type Payload = Omit<Student, "id" | "createdAt">;

export default function CalculatorView({
  students,
  editing,
  onSave,
  onCancel,
}: {
  students: Student[];
  editing: Student | null;
  onSave: (data: Payload) => void;
  onCancel: () => void;
}) {
  return (
    // key forces a fresh form when switching between add / different students
    <StudentForm
      key={editing?.id ?? "new"}
      editing={editing}
      students={students}
      onSubmit={onSave}
      onCancel={onCancel}
    />
  );
}
