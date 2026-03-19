import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * State for the one long-running background job in the product: pricing an
 * uploaded spreadsheet of listings.
 *
 * This lived on the auth slice, next to the JWT, because that was the only
 * slice that existed. It has nothing to do with authentication, and putting it
 * here means the Rental Analyzer's polling can be reasoned about — and
 * tested — on its own.
 */
export interface RentalTaskState {
  taskId: string | null;
  /** True between the upload returning a task id and the task settling. */
  polling: boolean;
  /** Covers the upload request itself, before a task id exists. */
  isUploading: boolean;
  progress: number;
  message: string | null;
}

const initialState: RentalTaskState = {
  taskId: null,
  polling: false,
  isUploading: false,
  progress: 0,
  message: null,
};

const rentalTaskSlice = createSlice({
  name: 'rentalTask',
  initialState,
  reducers: {
    uploadStarted: (state) => {
      state.isUploading = true;
      state.progress = 0;
      state.message = null;
    },

    taskStarted: (state, action: PayloadAction<string>) => {
      state.taskId = action.payload;
      state.polling = true;
      state.isUploading = false;
      state.progress = 0;
    },

    progressReported: (
      state,
      action: PayloadAction<{ progress: number; message?: string | null }>
    ) => {
      state.progress = action.payload.progress;
      state.message = action.payload.message ?? state.message;
    },

    /** Terminal: success, failure, or an upload that never produced a task. */
    taskSettled: (state) => {
      state.taskId = null;
      state.polling = false;
      state.isUploading = false;
      state.progress = 0;
      state.message = null;
    },
  },
});

export const { uploadStarted, taskStarted, progressReported, taskSettled } =
  rentalTaskSlice.actions;

export default rentalTaskSlice.reducer;
