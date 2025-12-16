import React, { useState, useEffect, useRef } from "react";
import { FiMoreVertical, FiEdit, FiTrash2 } from "react-icons/fi";
import { createPortal } from "react-dom";
interface RowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

const RowActions: React.FC<RowActionsProps> = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const dropdown = document.getElementById("row-actions-dropdown");
      if (open && buttonRef.current && !buttonRef.current.contains(e.target as Node) && dropdown && !dropdown.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY + 20,
        left: rect.right + window.scrollX - 130,
      });
    }
  }, [open]);

  if (!onEdit && !onDelete) return null;

  return (
    <>
      <button ref={buttonRef} className="p-1 rounded hover:bg-gray-100 hover:rounded" onClick={() => setOpen((prev) => !prev)}>
        <FiMoreVertical />
      </button>

      {open &&
        createPortal(
          <div id="row-actions-dropdown" className="absolute bg-white border rounded-xl shadow-ml z-50 w-28" style={{ top: coords.top, left: coords.left }}>
            {onEdit && (
              <button
                className="w-full px-4 py-2 flex items-center text-sm hover:bg-gray-100 rounded-t-xl"
                onClick={() => {
                  onEdit();
                  setOpen(false);
                }}
              >
                <FiEdit className="mr-2" /> Edit
              </button>
            )}
            {onDelete && (
              <button
                className={`w-full px-4 py-2 flex items-center text-sm hover:bg-gray-100 ${onEdit ? "rounded-b-xl" : "rounded-t-xl rounded-b-xl"}`}
                onClick={() => {
                  onDelete();
                  setOpen(false);
                }}
              >
                <FiTrash2 className="mr-2" /> Delete
              </button>
            )}
          </div>,

          document.body
        )}
    </>
  );
};

export default RowActions;
