// RegulationRow.tsx
import React from 'react';
import { Regulation } from '../types/regulationTypes';
import { useNavigate } from 'react-router-dom';

interface RegulationRowProps {
  regulation: Regulation;
  index: number;
}

const RegulationRow: React.FC<RegulationRowProps> = ({ regulation, index }) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/regulation/${regulation.id}/chat`);
  };

  return (
    <tr onClick={handleRowClick} className="hover:bg-gray-50 cursor-pointer">
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{index}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{regulation.date}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">{regulation.search}</td>
      <td className="px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">
        <span
          title={regulation.status}
          className={`px-2 py-1 rounded ${
            regulation.status === "STR Allowed with Restrictions" ? "bg-yellow-300 text-yellow-800" 
            : regulation.status === "STR Not Allowed" ? "bg-red-300 text-red-800" 
            : regulation.status === "STR Allowed" ? "bg-green-300 text-green-800" 
            : "bg-gray-300 text-gray-800"
          }`}
        >
          {regulation.status}
        </span>
      </td>
    </tr>
  );
};

export default RegulationRow;
