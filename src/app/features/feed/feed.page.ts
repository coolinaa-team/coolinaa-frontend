import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TuiButton, TuiError, TuiInput } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';
import { RecipeService } from '../../core/services/recipe.service';
import { RecipeCategoryService } from '../../core/services/recipe-category.service';
import { Recipe } from '../../core/models/recipe.model';
import { Page } from '../../core/models/page.model';
import { Category } from '../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-feed-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    TuiInput,
    TuiButton,
    TuiError,
    TuiCardLarge,
  ],
  templateUrl: './feed.page.html',
  styleUrl: './feed.page.css',
})
export class FeedPage implements OnInit, OnDestroy {
  private readonly recipesApi = inject(RecipeService);
  private readonly categoriesApi = inject(RecipeCategoryService);
  private searchSubject = new Subject<string>();

  protected recipes: Page<Recipe> | null = null;
  protected loading = false;
  protected error = '';
  protected query = '';
  protected categoryId: number | null = null;
  protected categories: Category[] = [];

  ngOnInit() {
    this.load();
    this.loadCategories();

    // Setup debounced search
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.load();
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  private loadCategories() {
    this.categoriesApi.list().subscribe({
      next: (res) => (this.categories = res),
      error: () => {
        this.categories = [];
      },
    });
  }

  load(page = 0) {
    this.loading = true;
    this.error = '';
    this.recipesApi
      .list({ page, search: this.query || undefined, categoryId: this.categoryId || undefined })
      .subscribe({
        next: (res) => {
          this.recipes = res;
          this.loading = false;
        },
        error: () => {
          this.error = 'Не удалось загрузить рецепты';
          this.loading = false;
        },
      });
  }

  setCategory(id: number | null) {
    this.categoryId = id;
    this.load();
  }
}
