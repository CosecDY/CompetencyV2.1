import React from "react";
import { FaRocket, FaExclamationTriangle } from "react-icons/fa";

interface OverviewSectionProps {
  overall?: string | null;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ overall }) =>
  overall ? (
    <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-teal-100 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <FaRocket className="w-6 h-6 mr-3 text-teal-600" />
        Overview
      </h2>
      <p className="text-gray-700 leading-relaxed text-lg">{overall}</p>
    </section>
  ) : null;

interface NotesSectionProps {
  note?: string | null;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ note }) =>
  note ? (
    <section className="bg-amber-50/90 backdrop-blur-sm rounded-2xl p-8 border border-amber-200 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <FaExclamationTriangle className="w-6 h-6 mr-3 text-amber-600" />
        Important Notes
      </h2>
      <p className="text-gray-700 leading-relaxed">{note}</p>
    </section>
  ) : null;
