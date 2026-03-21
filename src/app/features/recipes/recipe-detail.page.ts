import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecipeService } from '../../core/services/recipe.service';
import { ReviewService, Review } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { Recipe } from '../../core/models/recipe.model';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';

@Component({
  selector: 'app-recipe-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <ng-container *ngIf="!loading && recipe; else loadingOrMissing">
      <section class="space-y-4">
        <a routerLink="/recipes" class="text-sm text-accent-800">Назад к списку</a>
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-wide text-stone-500">{{ recipe.categoryName || 'Без категории' }}</p>
          <h1 class="text-3xl font-semibold text-stone-900">{{ recipe.title }}</h1>
          <p class="text-stone-700">{{ recipe.description || 'Описание скоро появится' }}</p>
        </div>
        <div class="flex flex-wrap gap-1 text-xs text-stone-600">
          <span class="px-2 py-1 rounded-full bg-stone-100 border border-stone-200" *ngIf="recipe.averageRating">
            ★ {{ recipe.averageRating | number: '1.1-1' }}
          </span>
          <span class="px-2 py-1 rounded-full bg-stone-100 border border-stone-200" *ngIf="recipe.cookingTime">
            {{ recipe.cookingTime }} мин
          </span>
          <span class="px-2 py-1 rounded-full bg-stone-100 border border-stone-200" *ngIf="recipe.servings">
            {{ recipe.servings }} порций
          </span>
        </div>
        <div class="rounded-2xl border border-stone-200 bg-white/90 p-4 space-y-2 text-sm text-stone-800">
          <p class="font-semibold">Инструкции</p>
          <p class="whitespace-pre-line leading-relaxed">{{ recipe.instructions }}</p>
        </div>
        <div class="rounded-2xl border border-stone-200 bg-white/90 p-4 space-y-2 text-sm text-stone-800" *ngIf="recipe.ingredients?.length">
          <p class="font-semibold">Ингредиенты</p>
          <ul class="space-y-1">
            <li *ngFor="let ing of recipe.ingredients">
              {{ ing.ingredientName || 'Ингредиент' }} — {{ ing.quantity || '?' }} {{ ing.unitName || '' }} {{ ing.notes || '' }}
            </li>
          </ul>
        </div>

        <div class="space-y-4">
          <p class="text-lg font-semibold">Отзывы ({{ reviews.length }})</p>
          
          <form *ngIf="auth.user() && !userHasReview" [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="rounded-2xl border border-stone-200 bg-white/90 p-4 space-y-3">
            <div>
              <label class="text-sm font-semibold text-stone-800">Оценка (1-5)</label>
              <div class="flex gap-2 mt-1">
                <button type="button" *ngFor="let i of [1,2,3,4,5]" (click)="reviewForm.patchValue({rating: i})" class="px-3 py-1 rounded-lg border transition" [ngClass]="reviewForm.value.rating === i ? 'bg-accent-600 text-white border-accent-600' : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'">
                  ★ {{ i }}
                </button>
              </div>
            </div>
            <label class="space-y-1 text-sm">
              <span class="font-semibold text-stone-800">Комментарий</span>
              <textarea class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" rows="3" formControlName="comment" placeholder="Поделитесь впечатлениями..."></textarea>
            </label>
            <button type="submit" class="px-4 py-2 rounded-lg bg-accent-600 text-white font-semibold disabled:opacity-60" [disabled]="reviewForm.invalid || submittingReview">
              {{ submittingReview ? 'Сохраняем...' : 'Добавить отзыв' }}
            </button>
          </form>

          <div *ngIf="reviews.length" class="space-y-2">
            <div *ngFor="let review of reviews" class="rounded-2xl border border-stone-200 bg-white/90 p-3 text-sm">
              <div class="flex items-center justify-between mb-1">
                <div>
                  <p class="font-semibold text-stone-900">{{ review.user?.username || 'Аноним' }}</p>
                  <p class="text-xs text-stone-500">★ {{ review.rating }} • {{ formatDate(review.createdAt) }}</p>
                </div>
                <button *ngIf="auth.user()?.id === review.userId" (click)="deleteReview(review.id)" class="text-red-500 text-xs font-semibold hover:text-red-700" [disabled]="deletingReviewId === review.id">
                  {{ deletingReviewId === review.id ? 'Удаляем...' : 'Удалить' }}
                </button>
              </div>
              <p class="text-stone-700">{{ review.comment }}</p>
            </div>
          </div>
          <p *ngIf="!reviews.length && !auth.user()" class="text-sm text-stone-500">Авторизуйтесь, чтобы оставить отзыв</p>
        </div>
      </section>
    </ng-container>
    <ng-template #loadingOrMissing>
      <section class="space-y-3">
        @if (loading) {
          <app-loading-spinner />
        } @else if (error) {
          <p class="text-lg font-semibold">{{ error }}</p>
          <a routerLink="/feed" class="text-amber-800 text-sm">Вернуться к ленте</a>
        }
      </section>
    </ng-template>
  `
})
export class RecipeDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly recipes = inject(RecipeService);
  private readonly reviewsApi = inject(ReviewService);
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);

  protected recipe: Recipe | null = null;
  protected reviews: Review[] = [];
  protected loading = false;
  protected error = '';
  protected submittingReview = false;
  protected deletingReviewId: number | null = null;
  protected userHasReview = false;

  reviewForm: FormGroup = this.fb.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loading = true;
      this.recipes.get(id).subscribe({
        next: (res) => {
          this.recipe = res;
          this.loading = false;
        },
        error: () => {
          this.error = 'Рецепт не найден';
          this.loading = false;
        }
      });
      this.loadReviews(id);
    } else {
      this.error = 'Рецепт не найден';
    }
  }

  private loadReviews(recipeId: number) {
    this.reviewsApi.list(recipeId).subscribe({
      next: (res) => {
        this.reviews = res;
        const userId = this.auth.user()?.id;
        this.userHasReview = userId ? res.some(r => r.userId === userId) : false;
      }
    });
  }

  submitReview() {
    if (this.reviewForm.invalid || !this.recipe) return;
    this.submittingReview = true;
    const payload = this.reviewForm.value;
    this.reviewsApi.create(this.recipe.id, payload).subscribe({
      next: () => {
        this.submittingReview = false;
        this.reviewForm.reset({ rating: 0, comment: '' });
        this.loadReviews(this.recipe!.id);
      },
      error: () => (this.submittingReview = false)
    });
  }

  deleteReview(reviewId: number) {
    if (!this.recipe) return;
    this.deletingReviewId = reviewId;
    this.reviewsApi.delete(this.recipe.id, reviewId).subscribe({
      next: () => {
        this.deletingReviewId = null;
        this.loadReviews(this.recipe!.id);
      },
      error: () => (this.deletingReviewId = null)
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ru-RU');
  }
}
