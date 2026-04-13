import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecipeService } from '../../../core/services/recipe.service';
import { Recipe } from '../../../core/models/recipe.model';
import { Page } from '../../../core/models/page.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-my-recipes-page',
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './my-recipes.page.html',
  styleUrl: './my-recipes.page.css',
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
      },
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
      },
    });
  }
}
