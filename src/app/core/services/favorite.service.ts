import { Injectable, inject } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Recipe } from '../models/recipe.model';
import { User } from '../models/user.model';

interface FavoriteRecipeRaw {
  id: number;
  title?: string;
  description?: string;
  instructions?: string;
  preparationTime?: number;
  cookingTime?: number;
  difficultyLevel?: number;
  servings?: number;
  imageUrl?: string;
  isPublic?: boolean;
  status?: string;
  categoryId?: number;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
  averageRating?: number;
  reviewCount?: number;
  author?: User;
  user?: User;
  category?: { id?: number; name?: string };
  reviews?: Array<{ rating?: number }>;
}

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  list(userId: number) {
    return this.api
      .get<FavoriteRecipeRaw[]>(`/favorites/${userId}`)
      .pipe(map((items) => (items || []).map((item) => this.normalizeRecipe(item))));
  }

  listForCurrentUser() {
    const userId = this.auth.user()?.id;
    if (!userId) {
      return of([] as Recipe[]);
    }
    return this.list(userId);
  }

  isFavorite(userId: number, recipeId: number) {
    return this.api.get<boolean>(`/favorites/${userId}/check/${recipeId}`);
  }

  add(userId: number, recipeId: number) {
    return this.api.post<void>('/favorites', { userId, recipeId });
  }

  remove(userId: number, recipeId: number) {
    return this.api.delete<void>(`/favorites/${userId}/${recipeId}`);
  }

  private normalizeRecipe(raw: FavoriteRecipeRaw): Recipe {
    const categoryId = raw.categoryId ?? raw.category?.id;
    const categoryName = raw.categoryName ?? raw.category?.name;
    const author = raw.author ?? raw.user;
    const averageRating =
      typeof raw.averageRating === 'number'
        ? raw.averageRating
        : this.getAverageRating(raw.reviews);
    const reviewCount = typeof raw.reviewCount === 'number' ? raw.reviewCount : raw.reviews?.length;

    return {
      id: raw.id,
      title: raw.title ?? '',
      description: raw.description,
      instructions: raw.instructions ?? '',
      preparationTime: raw.preparationTime,
      cookingTime: raw.cookingTime,
      difficultyLevel: raw.difficultyLevel,
      servings: raw.servings,
      imageUrl: raw.imageUrl,
      isPublic: raw.isPublic,
      status: raw.status,
      categoryId,
      categoryName,
      author,
      averageRating: averageRating ?? undefined,
      reviewCount: reviewCount ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  private getAverageRating(reviews?: Array<{ rating?: number }>): number | undefined {
    if (!reviews?.length) {
      return undefined;
    }
    const values = reviews.map((review) => review.rating ?? 0).filter((rating) => rating > 0);
    if (!values.length) {
      return undefined;
    }
    const total = values.reduce((sum, rating) => sum + rating, 0);
    return total / values.length;
  }
}
