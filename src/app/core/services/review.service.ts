import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Review {
  id: number;
  recipeId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { username: string };
}

export interface ReviewCreateRequest {
  rating: number;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly api = inject(ApiService);

  list(recipeId: number): Observable<Review[]> {
    return this.api.get(`/recipes/${recipeId}/reviews`);
  }

  create(recipeId: number, request: ReviewCreateRequest): Observable<Review> {
    return this.api.post(`/recipes/${recipeId}/reviews`, request);
  }

  delete(recipeId: number, reviewId: number): Observable<void> {
    return this.api.delete(`/recipes/${recipeId}/reviews/${reviewId}`);
  }
}
