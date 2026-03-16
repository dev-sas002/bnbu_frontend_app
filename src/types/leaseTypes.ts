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

/**
 * What the edit dialog may change. `status` is set by the document review and
 * the nested documents carry their own review status, so neither is sent:
 * echoing a stale copy back could undo a review that finished meanwhile.
 */
export type LeaseAddressUpdate = Pick<
  Lease,
  'id' | 'address1' | 'address2' | 'city' | 'state' | 'zip_code'
>;

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
