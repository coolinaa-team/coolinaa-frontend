import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class RecipeCategoryService {
  private readonly api = inject(ApiService);

  list() {
    return this.api.get<Category[]>('/recipe-categories');
  }

  create(data: { name: string; description?: string }) {
    return this.api.post<Category>('/recipe-categories', data);
  }

  update(id: number, data: { name: string; description?: string }) {
    return this.api.put<Category>(`/recipe-categories/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete<void>(`/recipe-categories/${id}`);
  }
}
