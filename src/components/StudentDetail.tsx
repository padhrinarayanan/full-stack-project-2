import type { Student } from "../types";
import { MAX_MARKS, fmt, getGrade, resultOf } from "../utils/grading";
import GradeBadge, { GRADE_TONE } from "./GradeBadge";
import Modal from "./Modal";

export default function StudentDetail({
  student,
  onClose,
  onEdit,
}: {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
}) {
  const r = resultOf(student);
  return (
    <Modal title={student.name} onClose={onClose}>
      <p className="-mt-3 mb-5 text-sm text-stone-500">
        Roll {student.roll}
        {student.className && ` · Class ${student.className}`}
      </p>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-stone-50 p-3">
          <p className="text-xs text-stone-500">Total</p>
          <p className="font-mono text-lg font-semibold text-stone-900">
            {fmt(r.total)}
            <span className="text-xs font-normal text-stone-400">/{r.max}</span>
          </p>
        </div>
        <div className="rounded-xl bg-stone-50 p-3">
          <p className="text-xs text-stone-500">Average</p>
          <p className="font-mono text-lg font-semibold text-stone-900">{fmt(r.average)}%</p>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3">
          <div>
            <p className="text-xs text-stone-500">Grade</p>
            <p className="text-xs font-medium text-stone-700">{r.remark}</p>
          </div>
          <GradeBadge grade={r.grade} />
        </div>
      </div>

      <ul className="space-y-3">
        {student.subjects.map((s) => (
          <li key={s.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-stone-700">{s.name}</span>
              <span className="font-mono text-stone-900">
                {s.marks}
                <span className="text-stone-400">/{MAX_MARKS}</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-100">
              <div
                className={`h-full rounded-full ${GRADE_TONE[getGrade(s.marks).grade].bar}`}
                style={{ width: `${(s.marks / MAX_MARKS) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
        >
          Close
        </button>
        <button
          onClick={onEdit}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          Edit marks
        </button>
      </div>
    </Modal>
  );
}
