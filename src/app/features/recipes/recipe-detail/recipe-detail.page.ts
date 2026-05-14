import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiInput } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';
import { RecipeService } from '../../../core/services/recipe.service';
import { ReviewService, Review } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorService } from '../../../core/services/error.service';
import { Recipe } from '../../../core/models/recipe.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

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
  ],
  templateUrl: './recipe-detail.page.html',
  styleUrl: './recipe-detail.page.css',
})
export class RecipeDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly recipes = inject(RecipeService);
  private readonly reviewsApi = inject(ReviewService);
  private readonly fb = inject(FormBuilder);
  private readonly errorService = inject(ErrorService);
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
    comment: ['', [Validators.required, Validators.minLength(1)]],
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
}
