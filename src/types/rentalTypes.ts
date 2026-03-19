// Constants for Rental Property Status
export enum RentalPropertyStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Error = 'Error',
}

/** Spreadsheet formats the upload endpoint accepts. */
export const VALID_FILE_EXTENSIONS: string[] = ['.xls', '.xlsx', '.csv'];

/** Columns the backend requires in an uploaded spreadsheet. */
export const REQUIRED_COLUMNS: string[] = ['Location', 'Price', 'Sq. ft.', 'Ba', 'Br', 'Link'];

export const CURRENCY_USD = 'usd';

/**
 * A rental property *as the API sends it*.
 *
 * Django's `DecimalField`s are serialised as strings (DRF's default, and this
 * project does not set `COERCE_DECIMAL_TO_STRING = False`), so `adr`,
 * `utilities`, `occupancy_rate`, `yearly_rent_cost_util` and
 * `monthly_estimated_profit` arrive as `"1850.00"`, not `1850`.
 */
export interface RawRentalProperty {
  id?: number;
  user_id?: number | null;
  created_at?: string | null;
  created_at_formatted?: string | null;
  updated_at?: string | null;
  location?: string | null;
  rent?: number | null;
  no_of_bedrooms?: number | null;
  no_of_bathrooms?: number | null;
  square_feet?: number | null;
  utilities?: string | number | null;
  adr?: string | number | null;
  occupancy_rate?: string | number | null;
  property_zillow_link: string;
  property_status: RentalPropertyStatus | string;
  yearly_rent_cost_util?: string | number | null;
  yearly_projected_revenue?: number | null;
  monthly_estimated_profit?: string | number | null;
  batch_id: number;
}

/**
 * The normalised form the UI works with. Money is a number here, because the
 * table sorts on it and the analytics panel sums it — comparing `"900.00"`
 * with `"1850.00"` as strings put the smaller figure last.
 */
export interface RentalProperty
  extends Omit<
    RawRentalProperty,
    'utilities' | 'adr' | 'occupancy_rate' | 'yearly_rent_cost_util' | 'monthly_estimated_profit'
  > {
  utilities?: number | null;
  adr?: number | null;
  occupancy_rate?: number | null;
  yearly_rent_cost_util?: number | null;
  monthly_estimated_profit?: number | null;
}

/** The object `filtered-list/` puts inside the paginator's `results`. */
export interface FilteredRentalResults {
  properties: RentalProperty[];
  all_batch_ids: number[];
}

export interface RentalFilters {
  min_profit?: number | string;
  max_profit?: number | string;
  status?: RentalPropertyStatus | string;
  batch_id?: number | string;
  start_date?: string;
  end_date?: string;
}

export interface RentalListArgs extends RentalFilters {
  page?: number;
  pageSize?: number;
}

/** Numeric decimal fields, normalised on the way in. */
export const RENTAL_DECIMAL_FIELDS = [
  'utilities',
  'adr',
  'occupancy_rate',
  'yearly_rent_cost_util',
  'monthly_estimated_profit',
] as const;

/** `"1850.00"` -> `1850`; anything unparseable -> `null`. */
export const toNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const normaliseRentalProperty = (raw: RawRentalProperty): RentalProperty => {
  const normalised = { ...raw } as RentalProperty;
  RENTAL_DECIMAL_FIELDS.forEach((field) => {
    normalised[field] = toNumber(raw[field]);
  });
  return normalised;
};
