import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../../core/services/recipe.service';
import { RecipeCategoryService } from '../../core/services/recipe-category.service';
import { RecipeMatch } from '../../core/models/recipe.model';
import { Category } from '../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';

@Component({
  selector: 'app-match-page',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <section class="space-y-4">
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold">Подбор по ингредиентам</h1>
        <p class="text-sm text-stone-500">Показываем рецепты, которым не хватает максимум трёх ингредиентов.</p>
      </div>

      <div class="flex flex-wrap gap-2 text-sm text-stone-700">
        <button
          class="px-3 py-1 rounded-full border border-stone-300 bg-white/90"
          [class.bg-accent-50]="selectedCategory === null"
          [class.text-accent-800]="selectedCategory === null"
          (click)="selectCategory(null)"
        >
          Все категории
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

      <div *ngIf="loading"><app-loading-spinner /></div>
      <div *ngIf="error" class="text-sm text-red-500">{{ error }}</div>

      <div class="space-y-3" *ngIf="viewMatches.length">
        <article
          *ngFor="let item of viewMatches"
          class="rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-sm space-y-2"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <h2 class="text-lg font-semibold text-stone-900">{{ item.title }}</h2>
              <p class="text-sm text-stone-600">{{ item.description || 'Без описания' }}</p>
            </div>
            <span class="text-xs px-2 py-1 rounded-full bg-accent-50 text-accent-800 border border-accent-100 whitespace-nowrap flex-shrink-0">
              {{ item.matchPercentage || 0 | number: '1.0-0' }}%
            </span>
          </div>
          <div class="text-xs text-stone-600 flex flex-wrap gap-1">
            <span class="px-2 py-1">Подходит: {{ item.matchedIngredients }}/{{ item.totalIngredients }}</span>
            <span *ngIf="item.missingIngredients?.length" class="px-2 py-1 bg-stone-100 rounded-full border border-stone-200">
              Не хватает: {{ item.missingIngredients?.length || 0 }}
            </span>
            <span *ngIf="item.categoryName" class="px-2 py-1 rounded-full bg-stone-100 border border-stone-200">
              {{ item.categoryName }}
            </span>
          </div>
        </article>
      </div>
      <div *ngIf="!loading && !viewMatches.length" class="text-sm text-stone-500">
        Добавьте продукты в холодильник или ослабьте фильтры, чтобы получить подборки.
      </div>
    </section>
  `
})
export class MatchPage implements OnInit {
  private readonly recipes = inject(RecipeService);
  private readonly categoriesApi = inject(RecipeCategoryService);

  private matches: RecipeMatch[] = [];
  protected viewMatches: RecipeMatch[] = [];
  protected loading = false;
  protected error = '';
  protected categories: Category[] = [];
  protected selectedCategory: number | null = null;
  private readonly maxMissing = 3;

  ngOnInit() {
    this.load();
    this.loadCategories();
  }

  private load() {
    this.loading = true;
    this.error = '';
    this.recipes.matchMe().subscribe({
      next: (res) => {
        this.matches = res || [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Не удалось получить подборку';
        this.loading = false;
      }
    });
  }

  private loadCategories() {
    this.categoriesApi.list().subscribe({
      next: (res) => (this.categories = res),
      error: () => (this.categories = [])
    });
  }

  protected selectCategory(id: number | null) {
    this.selectedCategory = id;
    this.applyFilters();
  }

  private applyFilters() {
    const filtered = this.matches
      .filter((item) => (item.missingIngredients?.length ?? 0) <= this.maxMissing)
      .filter((item) => (this.selectedCategory ? item.categoryId === this.selectedCategory : true));

    this.viewMatches = filtered.sort((a, b) => {
      const score = (x: RecipeMatch) => {
        const matched = x.matchedIngredients ?? 0;
        const total = x.totalIngredients ?? 1;
        return total ? matched / total : 0;
      };
      const missingCount = (x: RecipeMatch) => x.missingIngredients?.length ?? 0;

      const diff = score(b) - score(a);
      if (diff !== 0) return diff;
      return missingCount(a) - missingCount(b);
    });
  }
}
