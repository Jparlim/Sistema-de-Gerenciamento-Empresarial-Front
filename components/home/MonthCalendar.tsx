"use client";

import { Visit } from "@/lib/visits";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type MonthCalendarProps = {
  year: number;
  month: number;
  visits: Visit[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onMonthChange: (year: number, month: number) => void;
};

export default function MonthCalendar({
  year,
  month,
  visits,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: MonthCalendarProps) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;

  const daysWithVisits = new Set(visits.map((v) => v.data));

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function goPrevMonth() {
    const prev = new Date(year, month - 2, 1);
    onMonthChange(prev.getFullYear(), prev.getMonth() + 1);
  }

  function goNextMonth() {
    const next = new Date(year, month, 1);
    onMonthChange(next.getFullYear(), next.getMonth() + 1);
  }

  function handleDayClick(day: number) {
    const dateStr = `${year}-${pad(month)}-${pad(day)}`;
    onSelectDate(selectedDate === dateStr ? null : dateStr);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrevMonth}
          aria-label="Mês anterior"
          className="bg-none! bg-transparent! shadow-none text-gray-400! hover:text-gray-700! px-2"
        >
          {"<"}
        </button>
        <p className="font-semibold text-gray-800">
          {MONTH_NAMES[month - 1]}, {year}
        </p>
        <button
          type="button"
          onClick={goNextMonth}
          aria-label="Próximo mês"
          className="bg-none! bg-transparent! shadow-none text-gray-400! hover:text-gray-700! px-2"
        >
          {">"}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((day) => (
          <p key={day} className="text-xs font-semibold text-gray-400">
            {day}
          </p>
        ))}

        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;

          const dateStr = `${year}-${pad(month)}-${pad(day)}`;
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === todayStr;
          const hasVisit = daysWithVisits.has(dateStr);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`relative mx-auto flex w-8 h-8 rounded-full! text-sm shadow-none transition-colors ${
                isSelected
                  ? "bg-none! bg-blu! text-white! font-semibold"
                  : isToday
                    ? "bg-none! bg-blue-50! text-blu! font-semibold"
                    : "bg-none! bg-transparent! text-gray-700! hover:bg-none! hover:bg-gray-100!"
              }`}
            >
              {day}
              {hasVisit && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blu" />
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <button
          type="button"
          onClick={() => onSelectDate(null)}
          className="bg-none! bg-transparent! shadow-none text-xs text-blu! font-semibold mt-4 p-0! justify-start!"
        >
          Ver mês inteiro
        </button>
      )}
    </div>
  );
}
