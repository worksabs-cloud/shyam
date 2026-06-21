"use client";

import { cn } from "@/lib/utils";
import { UploadCloud, FileSpreadsheet, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

export function UploadZone({
  onUpload,
  uploading,
  accept = ".xlsx,.xls,.csv",
}: {
  onUpload: (file: File) => void;
  uploading?: boolean;
  accept?: string;
}) {
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    onUpload(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        drag ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50/50 hover:border-brand-400"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        {uploading ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : (
          <UploadCloud className="h-7 w-7" />
        )}
      </div>
      <div className="mt-4 text-sm font-semibold text-ink-800">
        {uploading ? "Uploading…" : "Drag & drop your Excel file here"}
      </div>
      <div className="mt-1 text-xs text-ink-500">or click to browse — .xlsx, .xls, .csv</div>
      {fileName && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-700 shadow-card">
          <FileSpreadsheet className="h-3.5 w-3.5 text-brand-600" />
          {fileName}
        </div>
      )}
    </div>
  );
}
