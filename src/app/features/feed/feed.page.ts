import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RecipeService } from '../../core/services/recipe.service';
import { RecipeCategoryService } from '../../core/services/recipe-category.service';
import { Recipe } from '../../core/models/recipe.model';
import { Page } from '../../core/models/page.model';
import { Category } from '../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <section class="space-y-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Популярные рецепты</h1>
          <p class="text-sm text-stone-500">Подборка блюд, которые готовят прямо сейчас.</p>
        </div>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <input
          class="w-full sm:max-w-xs rounded-xl border border-stone-300/70 bg-white/80 px-3 py-2 focus:outline-none focus:border-accent-600"
          type="search"
          placeholder="Поиск по названию"
          [(ngModel)]="query"
          (ngModelChange)="onSearchChange($event)"
        />
        <div class="flex gap-2 flex-wrap text-sm text-stone-700">
          <button
            class="px-3 py-1 rounded-full border border-stone-300 bg-white/90"
            [class.bg-accent-50]="categoryId === null"
            [class.text-accent-800]="categoryId === null"
            (click)="setCategory(null)"
          >
            Все
          </button>
          <button
            *ngFor="let cat of categories"
            class="px-3 py-1 rounded-full border border-stone-300 bg-white/90"
            [class.bg-accent-50]="categoryId === cat.id"
            [class.text-accent-800]="categoryId === cat.id"
            (click)="setCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else if (error) {
        <div class="text-sm text-red-500">{{ error }}</div>
      } @else if (recipes?.content?.length) {
        <div class="grid gap-3">
          <article
            *ngFor="let recipe of recipes?.content"
            class="rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-sm"
          >
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="space-y-1 flex-1">
              <div class="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                <span>{{ recipe.categoryName || 'Без категории' }}</span>
                <span>&bull;</span>
                <span>{{ recipe.cookingTime ? recipe.cookingTime + ' мин' : 'Время не указано' }}</span>
              </div>
              <h2 class="text-lg font-semibold text-stone-900">{{ recipe.title }}</h2>
              <p class="text-sm text-stone-600">{{ recipe.description || 'Описание скоро появится' }}</p>
            </div>
            <a routerLink="/recipes/{{ recipe.id }}" class="text-sm text-accent-800 whitespace-nowrap flex-shrink-0">Открыть</a>
          </div>
          <div class="flex flex-wrap gap-1 text-xs text-stone-600">
            <span class="px-2 py-1 rounded-full bg-stone-100 border border-stone-200" *ngIf="recipe.averageRating">
              ★ {{ recipe.averageRating | number: '1.1-1' }}
            </span>
            <span class="px-2 py-1 rounded-full bg-stone-100 border border-stone-200" *ngIf="recipe.servings">
              {{ recipe.servings }} порций
            </span>
          </div>
        </article>
      </div>
      } @else {
        <div class="text-sm text-stone-500">Нет рецептов.</div>
      }
    </section>
  `
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
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
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
      }
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
        }
      });
  }

  setCategory(id: number | null) {
    this.categoryId = id;
    this.load();
  }
}
