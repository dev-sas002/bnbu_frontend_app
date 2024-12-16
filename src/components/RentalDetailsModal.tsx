import React from "react";
import { RentalProperty } from "../types/rentalTypes";

interface RentalDetailsModalProps {
  rental: RentalProperty | null;
  onClose: () => void;
}

const RentalDetailsModal: React.FC<RentalDetailsModalProps> = ({ rental, onClose }) => {
  if (!rental) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 focus:outline-none"
        >
          <span className="text-2xl">&times;</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-red-600">Rental Property Details</h2>
          <p className="text-sm text-gray-500">Detailed information about the selected property</p>
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          {[
            { label: "Date", value: rental.created_at_formatted },
            { label: "Batch ID", value: rental.batch_id },
            { label: "Location", value: rental.location },
            { label: "Rent", value: rental.rent },
            { label: "Square Feet", value: rental.square_feet },
            { label: "Bedrooms", value: rental.no_of_bedrooms },
            { label: "Bathrooms", value: rental.no_of_bathrooms },
            {
              label: "Link",
              value: (
                <a
                  href={rental.property_zillow_link}
                  className="text-red-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Property
                </a>
              ),
            },
            { label: "Adr", value: `$${rental.adr || 0}` },
            { label: "Utilities", value: `$${rental.utilities || 0}` },
            { label: "Estimated Profit", value: `$${rental.monthly_estimated_profit || 0}` },
            { label: "Estimated Earnings", value: `$${rental.yearly_projected_revenue || 0}` },
            { label: "Yearly Rent Cost", value: `$${rental.yearly_rent_cost_util || 0}` },
            { label: "Occupancy Rate", value: `${rental.occupancy_rate || 0}%` },
            { label: "Zillow Property Status", value: rental.property_status },
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">{item.label}:</span>
              <span className="text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RentalDetailsModal;
