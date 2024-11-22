// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/types/leaseTypes.ts

export interface Document {
  id: number;
  name: string;
  file: string;
  version: string;
  uploaded_at: string;
  status: string;
}

export interface Lease {
  id: number;
  date: string;
  address1: string; 
  address2?: string;
  city: string;
  state: string;
  zip_code: string;
  status: 'Draft' | 'Rejected' | 'Approved';
  num_of_docs: number;
  documents?: Document[];
}

