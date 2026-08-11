"use client";

import { useEffect, useRef, useState } from "react";

type RowActionsMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export default function RowActionsMenu({ onEdit, onDelete }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Mais ações"
        className="bg-none! bg-transparent! shadow-none text-gray-400! hover:text-gray-700! px-2"
      >
        ...
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-sm border border-gray-100 py-1 z-10 min-w-[130px]">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="bg-none! bg-transparent! shadow-none text-gray-700! hover:bg-gray-50! justify-start! w-full px-4 py-2 rounded-none!"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="bg-none! bg-transparent! shadow-none text-red-500! hover:bg-red-50! justify-start! w-full px-4 py-2 rounded-none!"
          >
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}
