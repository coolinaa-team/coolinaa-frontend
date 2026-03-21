import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Page } from '../models/page.model';
import { Ingredient } from '../models/ingredient.model';
import { Unit } from '../models/unit.model';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly api = inject(ApiService);

  list(params: { page?: number; size?: number; categoryId?: number; search?: string } = {}) {
    return this.api.get<Page<Ingredient>>('/ingredients', { params });
  }

  create(data: { name: string; description?: string; categoryId?: number }) {
    return this.api.post<Ingredient>('/ingredients', data);
  }

  update(id: number, data: { name?: string; description?: string; categoryId?: number; isActive?: boolean }) {
    return this.api.put<Ingredient>(`/ingredients/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete<void>(`/ingredients/${id}`);
  }

  units() {
    return this.api.get<Unit[]>('/units');
  }
}
