import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { UserIngredientRequest, UserIngredient } from '../models/ingredient.model';

@Injectable({ providedIn: 'root' })
export class UserIngredientService {
  private readonly api = inject(ApiService);

  listAll() {
    return this.api.get<UserIngredient[]>('/user-ingredients/all');
  }

  add(payload: UserIngredientRequest) {
    return this.api.post<UserIngredient>('/user-ingredients', payload);
  }

  remove(ingredientId: number) {
    return this.api.delete<void>(`/user-ingredients/${ingredientId}`);
  }
}
