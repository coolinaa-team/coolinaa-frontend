import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE } from './api.service';

export interface UploadedFile {
  id: number;
  originalFileName?: string;
  s3Key?: string;
  contentType?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly http = inject(HttpClient);

  upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadedFile>(`${API_BASE}/files/upload`, formData);
  }

  getFileUrl(id: number): string {
    return `${API_BASE}/files/${id}`;
  }
}
