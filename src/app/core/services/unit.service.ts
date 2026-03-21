import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Unit } from '../models/unit.model';

@Injectable({ providedIn: 'root' })
export class UnitService {
  private readonly api = inject(ApiService);

  list() {
    return this.api.get<Unit[]>('/units');
  }

  create(data: { name: string; abbreviation?: string; isMetric?: boolean }) {
    return this.api.post<Unit>('/units', data);
  }

  update(id: number, data: { name?: string; abbreviation?: string; isMetric?: boolean }) {
    return this.api.put<Unit>(`/units/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete<void>(`/units/${id}`);
  }
}
