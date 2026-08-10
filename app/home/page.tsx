"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import MonthCalendar from "@/components/home/MonthCalendar";
import VisitsTable from "@/components/home/VisitsTable";
import NewVisitModal from "@/components/home/NewVisitModal";
import { listVisits, deleteVisit, Visit } from "@/lib/visits";
import { ApiError } from "@/lib/api";

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

export default function Home() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await listVisits(year, month);
      setVisits(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/register");
        return;
      }
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar as visitas.",
      );
    } finally {
      setLoading(false);
    }
  }, [year, month, router]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  function handleMonthChange(newYear: number, newMonth: number) {
    setYear(newYear);
    setMonth(newMonth);
    setSelectedDate(null);
  }

  async function handleDelete(visit: Visit) {
    if (!confirm(`Excluir a visita de ${visit.nome}?`)) return;

    setDeletingId(visit.id);
    try {
      await deleteVisit(visit.id);
      setVisits((prev) => prev.filter((v) => v.id !== visit.id));
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Não foi possível excluir a visita.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleCreated(visit: Visit) {
    setShowModal(false);

    const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
    if (!visit.data.startsWith(monthPrefix)) return;

    setVisits((prev) =>
      [...prev, visit].sort((a, b) =>
        a.data === b.data
          ? a.hora.localeCompare(b.hora)
          : a.data.localeCompare(b.data),
      ),
    );
  }

  const visibleVisits = selectedDate
    ? visits.filter((v) => v.data === selectedDate)
    : visits;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-4xl font-semibold">Visitas Agendadas</h1>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-6 h-12"
        >
          + Adicionar visita
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 inline-flex flex-col">
        <p className="text-sm text-gray-400">
          Visitas em {MONTH_NAMES[month - 1]}/{year}
        </p>
        <p className="text-5xl font-semibold text-blu">
          {loading ? "…" : visits.length}
        </p>
      </div>

      {erro && <p className="text-red-600 font-semibold mb-4">{erro}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        <MonthCalendar
          year={year}
          month={month}
          visits={visits}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onMonthChange={handleMonthChange}
        />

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 w-full flex items-center justify-center text-gray-400 text-sm min-h-[200px]">
            Carregando visitas...
          </div>
        ) : (
          <VisitsTable
            visits={visibleVisits}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </div>

      {showModal && (
        <NewVisitModal
          defaultDate={selectedDate}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </AppShell>
  );
}
