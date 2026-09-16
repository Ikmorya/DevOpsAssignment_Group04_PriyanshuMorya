const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface UploadResponse {
  code: string;
  expiresAt: string;
  fileCount: number;
  id: string;
}

export interface FileEntry {
  filename: string;
  mimetype: string;
  size: number;
  fileType: 'code' | 'normal';
}

export interface RetrieveResponse {
  code: string;
  files: FileEntry[];
  expiresAt: string;
  downloadCount: number;
  burnAfterRead: boolean;
}

/**
 * Upload multiple files, returns { code, expiresAt, fileCount, id }
 */
export async function uploadFiles(
  files: File[],
  burnAfterRead: boolean,
  onProgress?: (pct: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  formData.append('burnAfterRead', String(burnAfterRead));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/api/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const body = JSON.parse(xhr.responseText);
        reject(new Error(body.error || 'Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload.'));
    xhr.send(formData);
  });
}

/**
 * Fetch metadata for a given 4-character code
 */
export async function retrieveCode(code: string): Promise<RetrieveResponse> {
  const res = await fetch(`${API_URL}/api/retrieve/${code}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Retrieval failed');
  return data;
}

/**
 * Returns the download URL for a specific file index under a code.
 * This is a direct link — the browser handles streaming/download.
 */
export function getDownloadUrl(code: string, index: number): string {
  return `${API_URL}/api/retrieve/${code}/download/${index}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatExpiry(isoDate: string): string {
  const exp = new Date(isoDate);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  if (diffMs <= 0) return 'Expired';
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const CODE_EXTENSIONS = new Set([
  'js','ts','jsx','tsx','py','java','c','cpp','cs','go',
  'rb','php','sh','bash','html','css','json','xml','yaml',
  'yml','toml','rs','swift','kt','sql','txt','md',
]);

export function getFileTypeIcon(filename: string, fileType: string): string {
  if (fileType === 'code') return '📄';
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['png','jpg','jpeg','gif','webp','svg'].includes(ext)) return '🖼️';
  if (['mp4','webm','mov'].includes(ext))   return '🎬';
  if (['mp3','wav','ogg'].includes(ext))    return '🎵';
  if (['zip','rar','7z','tar','gz'].includes(ext)) return '📦';
  if (['pdf'].includes(ext))                return '📕';
  if (['doc','docx'].includes(ext))         return '📝';
  if (['xls','xlsx'].includes(ext))         return '📊';
  return '📁';
}
