import React, { useState } from 'react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { cn } from './cn';
import { CloseIcon, UploadIcon } from './icons';

export interface DropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept: Accept;
  maxFiles?: number;
  /** Shown under the prompt, e.g. "PDF only, up to 20 files". */
  hint?: string;
  disabled?: boolean;
  id?: string;
}

const describeRejection = ([first]: FileRejection[], accept: Accept): string => {
  if (first.errors.some((error) => error.code === 'file-invalid-type')) {
    const extensions = Object.values(accept).flat().join(', ');
    return `${first.file.name} was not added: only ${extensions} files are accepted.`;
  }
  return `${first.file.name} was not added: ${first.errors[0]?.message ?? 'it was rejected'}.`;
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * File selection, once.
 *
 * All three upload dialogs had their own copy of this — the same dashed box,
 * the same inline SVG, the same `${files.length} file(s) selected` string —
 * and none of them let you remove a file you had added by mistake.
 */
const Dropzone: React.FC<DropzoneProps> = ({
  files,
  onFilesChange,
  accept,
  maxFiles = 1,
  hint,
  disabled = false,
  id,
}) => {
  // A refused file used to vanish without a word, which reads as a broken
  // picker rather than a wrong format.
  const [rejection, setRejection] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    disabled,
    onDropRejected: (rejections) => setRejection(describeRejection(rejections, accept)),
    onDrop: (accepted, rejections) => {
      if (rejections.length === 0) setRejection(null);
      if (accepted.length === 0) return;
      onFilesChange(maxFiles === 1 ? accepted.slice(0, 1) : [...files, ...accepted]);
    },
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center rounded-md border-2 border-dashed px-6 py-8 text-center transition-colors',
          disabled && 'cursor-not-allowed opacity-60',
          isDragActive
            ? 'border-brand-500 bg-brand-50'
            : 'border-line-strong hover:border-brand-400 hover:bg-surface-sunken'
        )}
      >
        <input {...getInputProps()} id={id} />
        <span className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-surface-accent text-ink-subtle">
          <UploadIcon />
        </span>
        <p className="text-base font-medium text-ink">
          {isDragActive ? 'Drop to add' : 'Drop a file here, or click to choose'}
        </p>
        {hint && <p className="mt-1 text-xs text-ink-subtle">{hint}</p>}
      </div>

      {rejection && (
        <p role="alert" className="text-sm text-negative-fg">
          {rejection}
        </p>
      )}

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface-sunken px-3 py-2"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{file.name}</span>
                <span className="block text-xs text-ink-subtle">{formatSize(file.size)}</span>
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => onFilesChange(files.filter((_, at) => at !== index))}
                className="rounded p-1 text-ink-subtle transition-colors hover:bg-surface-accent hover:text-ink"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropzone;
