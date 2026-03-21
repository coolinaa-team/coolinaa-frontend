import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RecipeService } from '../../core/services/recipe.service';
import { RecipeCategoryService } from '../../core/services/recipe-category.service';
import { Recipe } from '../../core/models/recipe.model';
import { Page } from '../../core/models/page.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-recipe-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="space-y-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Все рецепты</h1>
          <p class="text-sm text-stone-500">Лента идей</p>
        </div>
        <a class="px-3 py-2 rounded-xl bg-accent-600 text-white text-sm font-semibold" routerLink="/recipes/create">
          Новый рецепт
        </a>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <input
          class="w-full sm:max-w-xs rounded-xl border border-stone-300 bg-white/90 px-3 py-2 focus:outline-none focus:border-accent-600"
          type="search"
          placeholder="Поиск рецептов"
          [(ngModel)]="query"
          (ngModelChange)="load()"
        />
        <div class="flex gap-2 flex-wrap text-sm text-stone-700">
          <button
            class="px-3 py-1 rounded-full border border-stone-300 bg-white/90"
            [class.bg-accent-50]="selectedCategory === null"
            [class.text-accent-800]="selectedCategory === null"
            (click)="selectCategory(null)"
          >
            Все
          </button>
          <button
            *ngFor="let cat of categories"
            class="px-3 py-1 rounded-full border border-stone-300 bg-white/90"
            [class.bg-accent-50]="selectedCategory === cat.id"
            [class.text-accent-800]="selectedCategory === cat.id"
            (click)="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="text-sm text-stone-500">Загружаем...</div>
      <div *ngIf="error" class="text-sm text-red-500">{{ error }}</div>

      <div class="grid gap-3" *ngIf="recipes?.content?.length">
        <article
          *ngFor="let recipe of recipes?.content"
          class="rounded-2xl border border-stone-200 bg-white/90 p-4 space-y-2 shadow-sm"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <h2 class="text-lg font-semibold text-stone-900">{{ recipe.title }}</h2>
              <p class="text-sm text-stone-600">{{ recipe.description || 'Описание скоро появится' }}</p>
            </div>
            <span class="text-xs px-2 py-1 rounded-full bg-accent-50 text-accent-800 border border-accent-100 whitespace-nowrap flex-shrink-0">
              {{ recipe.cookingTime ? recipe.cookingTime + ' мин' : 'Время не указано' }}
            </span>
          </div>
          <div class="flex flex-wrap gap-2 text-xs text-stone-600">
            <span class="px-2 py-1 rounded-full bg-stone-100 border border-stone-200">
              {{ recipe.categoryName || 'Без категории' }}
            </span>
            <span class="px-2 py-1 rounded-full bg-stone-100 border border-stone-200" *ngIf="recipe.averageRating">
              ★ {{ recipe.averageRating | number: '1.1-1' }}
            </span>
          </div>
          <div class="pt-1">
            <a routerLink="/recipes/{{ recipe.id }}" class="text-sm text-accent-800">Подробнее</a>
          </div>
        </article>
      </div>
      <div *ngIf="!loading && !recipes?.content?.length" class="text-sm text-stone-500">Пока нет рецептов.</div>
    </section>
  `
})
export class RecipeListPage implements OnInit {
  private readonly recipesApi = inject(RecipeService);
  private readonly categoriesApi = inject(RecipeCategoryService);

  protected recipes: Page<Recipe> | null = null;
  protected query = '';
  protected selectedCategory: number | null = null;
  protected loading = false;
  protected error = '';
  protected categories: Category[] = [];

  ngOnInit() {
    this.load();
    this.loadCategories();
  }

  private loadCategories() {
    this.categoriesApi.list().subscribe({
      next: (res) => (this.categories = res),
      error: () => (this.categories = [])
    });
  }

  load(page = 0) {
    this.loading = true;
    this.error = '';
    this.recipesApi
      .list({ page, search: this.query || undefined, categoryId: this.selectedCategory || undefined })
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

  protected selectCategory(tag: number | null) {
    this.selectedCategory = tag;
    this.load();
  }
}
