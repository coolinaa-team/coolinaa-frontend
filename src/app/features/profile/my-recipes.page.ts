import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecipeService } from '../../core/services/recipe.service';
import { Recipe } from '../../core/models/recipe.model';
import { Page } from '../../core/models/page.model';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner.component';

@Component({
  selector: 'app-my-recipes-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <section class="space-y-5 mt-4">
      <a routerLink="/profile" class="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-amber-700 transition">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Назад в профиль
      </a>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold tracking-tight">Мои рецепты</h1>
        <a routerLink="/recipes/create" class="text-sm px-4 py-2 rounded-full bg-amber-600 text-white font-semibold shadow-lg shadow-amber-200/60 hover:bg-amber-700 transition">
          Создать рецепт
        </a>
      </div>

      @if (loading) {
        <app-loading-spinner />
      }

      @if (error) {
        <div class="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{{ error }}</div>
      }

      @if (!loading && recipes && recipes.content.length > 0) {
        <div class="space-y-3">
          @for (recipe of recipes.content; track recipe.id) {
            <div class="p-4 rounded-2xl bg-white/80 backdrop-blur shadow-lg shadow-amber-200/50 border border-stone-200">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <a [routerLink]="['/recipes', recipe.id]" class="text-lg font-semibold text-stone-900 hover:text-amber-700 transition">
                    {{ recipe.title }}
                  </a>
                  @if (recipe.description) {
                    <p class="text-sm text-stone-600 mt-1 line-clamp-2">{{ recipe.description }}</p>
                  }
                  <div class="flex items-center gap-3 mt-2 text-xs text-stone-500">
                    @if (recipe.preparationTime || recipe.cookingTime) {
                      <span>⏱️ {{ (recipe.preparationTime || 0) + (recipe.cookingTime || 0) }} мин</span>
                    }
                    @if (recipe.categoryName) {
                      <span>📁 {{ recipe.categoryName }}</span>
                    }
                  </div>
                </div>
                <button
                  (click)="confirmDelete(recipe)"
                  class="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition"
                >
                  Удалить
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (!loading && recipes && recipes.content.length === 0) {
        <div class="text-center py-12">
          <p class="text-stone-500 mb-4">У вас пока нет рецептов</p>
          <a routerLink="/recipes/create" class="inline-block px-6 py-3 rounded-full bg-amber-600 text-white font-semibold shadow-lg shadow-amber-200/60 hover:bg-amber-700 transition">
            Создать первый рецепт
          </a>
        </div>
      }

      @if (showDeleteConfirm && recipeToDelete) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" (click)="cancelDelete()">
          <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-bold mb-2">Удалить рецепт?</h3>
            <p class="text-sm text-stone-600 mb-4">Вы уверены, что хотите удалить "{{ recipeToDelete.title }}"?</p>
            <div class="flex gap-3">
              <button
                (click)="cancelDelete()"
                class="flex-1 px-4 py-2 rounded-lg bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition"
              >
                Отмена
              </button>
              <button
                (click)="deleteRecipe()"
                class="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                [disabled]="deleting"
              >
                {{ deleting ? 'Удаление...' : 'Удалить' }}
              </button>
            </div>
          </div>
        </div>
      }
    </section>
  `
})
export class MyRecipesPage implements OnInit {
  private readonly recipeService = inject(RecipeService);

  protected recipes: Page<Recipe> | null = null;
  protected loading = false;
  protected error = '';
  protected showDeleteConfirm = false;
  protected recipeToDelete: Recipe | null = null;
  protected deleting = false;

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading = true;
    this.error = '';
    this.recipeService.myRecipes({ size: 50 }).subscribe({
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

  confirmDelete(recipe: Recipe) {
    this.recipeToDelete = recipe;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.recipeToDelete = null;
  }

  deleteRecipe() {
    if (!this.recipeToDelete) return;

    this.deleting = true;
    this.recipeService.delete(this.recipeToDelete.id).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.deleting = false;
        this.recipeToDelete = null;
        this.load();
      },
      error: () => {
        this.error = 'Не удалось удалить рецепт';
        this.deleting = false;
      }
    });
  }
}
