import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Page } from '../models/page.model';
import { Recipe, RecipeCreateRequest, RecipeMatch } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly api = inject(ApiService);

  list(params: { page?: number; size?: number; search?: string; categoryId?: number } = {}) {
    return this.api.get<Page<Recipe>>('/recipes', { params });
  }

  get(id: number) {
    return this.api.get<Recipe>(`/recipes/${id}`);
  }

  create(payload: RecipeCreateRequest) {
    return this.api.post<Recipe>('/recipes', payload);
  }

  matchMe() {
    return this.api.get<RecipeMatch[]>('/recipes/match/me');
  }

  myRecipes(params: { page?: number; size?: number } = {}) {
    return this.api.get<Page<Recipe>>('/recipes/my', { params });
  }

  delete(id: number) {
    return this.api.delete<void>(`/recipes/${id}`);
  }
}
