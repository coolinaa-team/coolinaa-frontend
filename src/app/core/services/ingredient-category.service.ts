import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class IngredientCategoryService {
  private readonly api = inject(ApiService);

  list() {
    return this.api.get<Category[]>('/ingredient-categories');
  }

  create(data: { name: string; description?: string }) {
    return this.api.post<Category>('/ingredient-categories', data);
  }

  update(id: number, data: { name: string; description?: string }) {
    return this.api.put<Category>(`/ingredient-categories/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete<void>(`/ingredient-categories/${id}`);
  }
}
