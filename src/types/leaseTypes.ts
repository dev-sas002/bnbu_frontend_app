import type { ChatTurn, GptAnalysis } from './api';

export type LeaseStatus = 'Draft' | 'Rejected' | 'Approved' | 'Pending';

export interface Document {
  id: number;
  lease_id?: number;
  name: string;
  /** The local FileField. Normally `null` — uploads live on Cloudinary. */
  file?: string | null;
  /**
   * Only present on `documents/lease/:id/documents/` and
   * `documents/preview/:id/`; the nested serializer does not expose it.
   */
  file_url?: string | null;
  version?: number | string;
  uploaded_at: string;
  status: LeaseStatus | string;
  gpt_response?: GptAnalysis | null;
  chat_history?: ChatTurn[];
}

export interface Lease {
  id: number;
  date: string;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  zip_code: string;
  status: LeaseStatus | string;
  num_of_docs: number;
  documents?: Document[];
}

export interface LeaseSearchParams {
  page?: number;
  address?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

/** Response of `POST api/leases/:id/revised/`. */
export interface ReviseLeaseResponse {
  document_ids?: number[];
  status?: string;
}

/** Response of `POST api/leases/upload/`. */
export interface UploadLeaseResponse extends Partial<Lease> {
  documents?: Document[];
}
