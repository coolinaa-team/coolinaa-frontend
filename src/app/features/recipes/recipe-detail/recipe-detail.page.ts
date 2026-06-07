import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiInput, TuiIcon } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';
import { RecipeService } from '../../../core/services/recipe.service';
import { ReviewService, Review } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { TuiNotificationService } from '@taiga-ui/core/components/notification';
import { ErrorService } from '../../../core/services/error.service';
import { Recipe } from '../../../core/models/recipe.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { AuthenticatedImageDirective } from '../../../shared/authenticated-image.directive';

@Component({
  selector: 'app-recipe-detail-page',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    TuiButton,
    TuiError,
    TuiInput,
    TuiCardLarge,
    AuthenticatedImageDirective,
  ],
  templateUrl: './recipe-detail.page.html',
  styleUrl: './recipe-detail.page.css',
})
export class RecipeDetailPage implements OnInit {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly recipes = inject(RecipeService);
  private readonly reviewsApi = inject(ReviewService);
  private readonly fb = inject(FormBuilder);
  private readonly errorService = inject(ErrorService);
  protected readonly auth = inject(AuthService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly notification = inject(TuiNotificationService);

  protected recipe: Recipe | null = null;
  protected reviews: Review[] = [];
  protected loading = false;
  protected error = '';
  protected isFavorite = false;
  protected favoriteLoading = false;
  protected submittingReview = false;
  protected deletingReviewId: number | null = null;
  protected userHasReview = false;

  reviewForm: FormGroup = this.fb.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(1)]],
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loading = true;
      this.recipes.get(id).subscribe({
        next: (res) => {
          this.recipe = res;
          this.checkFavorite();
          this.loading = false;
        },
        error: (err) => {
          this.error = this.errorService.extractErrorMessage(err);
          this.loading = false;
        },
      });
      this.loadReviews(id);
    } else {
      this.error = 'Рецепт не найден';
    }
  }

  private checkFavorite() {
    const userId = this.auth.user()?.id;
    if (!userId || !this.recipe) return;
    this.favoriteService.isFavorite(userId, this.recipe.id).subscribe({
      next: (res) => (this.isFavorite = !!res),
      error: () => (this.isFavorite = false),
    });
  }

  toggleFavorite() {
    const userId = this.auth.user()?.id;
    if (!userId || !this.recipe) {
      this.notification
        .open('Необходимо авторизоваться, чтобы управлять избранным', { appearance: 'warning' })
        .subscribe();
      return;
    }

    this.favoriteLoading = true;
    if (!this.isFavorite) {
      this.favoriteService.add(userId, this.recipe.id).subscribe({
        next: () => {
          this.isFavorite = true;
          this.favoriteLoading = false;
          this.notification.open('Добавлено в избранное', { appearance: 'positive' }).subscribe();
        },
        error: () => (this.favoriteLoading = false),
      });
    } else {
      this.favoriteService.remove(userId, this.recipe.id).subscribe({
        next: () => {
          this.isFavorite = false;
          this.favoriteLoading = false;
          this.notification.open('Удалено из избранного', { appearance: 'info' }).subscribe();
        },
        error: () => (this.favoriteLoading = false),
      });
    }
  }

  private loadReviews(recipeId: number) {
    this.reviewsApi.list(recipeId).subscribe({
      next: (res) => {
        this.reviews = res;
        const userId = this.auth.user()?.id;
        this.userHasReview = userId ? res.some((r) => r.userId === userId) : false;
      },
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
      error: () => (this.submittingReview = false),
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
      error: () => (this.deletingReviewId = null),
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ru-RU');
  }

  goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
      return;
    }

    this.router.navigate(['/feed']);
  }
}
