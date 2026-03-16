// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/types/rentalTypes.ts
// rentalTypes.ts

// Constants for Rental Property Status
export enum RentalPropertyStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Error = "Error"
}

// Constants for valid file extensions
export const VALID_FILE_EXTENSIONS: string[] = [".xls", ".xlsx", ".csv"];

// Required columns for rental property data
export const REQUIRED_COLUMNS: string[] = [
  "Location",
  "Price",
  "Sq. ft.",
  "Ba",
  "Br",
  "Link"
];

// Important columns for processing rental property data
export const IMPORTANT_COLUMNS: string[] = ["Ba", "Br", "Price", "Link"];

// Currency type
export const CURRENCY_USD = "usd";

// Interface for RentalProperty
export interface RentalProperty {
  created_at?: string | null;
  created_at_formatted?: string | null;
  updated_at?: string | null;
  location?: string | null;
  rent?: number | null;
  no_of_bedrooms?: number | null;
  no_of_bathrooms?: number | null;
  square_feet?: number | null;
  utilities?: number | null;
  adr?: number | null;
  occupancy_rate?: number | null;
  property_zillow_link: string;
  property_status: RentalPropertyStatus;
  yearly_rent_cost_util?: number | null;
  yearly_projected_revenue?: number | null;
  monthly_estimated_profit?: number | null;
  batch_id: number;
}

export interface AllPropertiesArgs {
  page?: number;
}
