import React, { useState } from 'react';
import RegulationRow from './RegulationRow';
import { Regulation } from '../types/regulationTypes';

interface RegulationTableProps {
  regulations: Regulation[];
}

const RegulationTable: React.FC<RegulationTableProps> = ({ regulations = [] }) => {
  return (
    <div className="overflow-x-auto mt-6 w-full">
      <table className="w-full table-auto divide-y divide-gray-200">
        <thead className="bg-gray-200">
          <tr>
            {['#', 'Date', 'Search', 'Status'].map((header, idx) => (
              <th 
                key={idx} 
                className="px-4 md:px-6 py-3 text-center text-xs font-bold uppercase text-gray-700">{header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {regulations.length > 0 ? (
            regulations.map((regulation, idx) => (
              <RegulationRow 
                key={regulation.id} 
                regulation={regulation} 
                index={idx + 1} 
              />
            ))
          ) : (
            <tr>
              <td colSpan={10} className="px-4 py-4 text-center text-gray-500">
                No regulations available
              </td>
            </tr>
          )}      
  
        </tbody>
      </table>
    </div>
  );
};

export default RegulationTable;
