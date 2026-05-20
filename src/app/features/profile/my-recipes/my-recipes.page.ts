import { Component, OnInit, inject } from '@angular/core';

import { RouterLink } from '@angular/router';
import { TuiButton, TuiError, TuiIcon } from '@taiga-ui/core';
import { TuiNotificationService } from '@taiga-ui/core/components/notification';
import { TuiCardLarge } from '@taiga-ui/layout';
import { RecipeService } from '../../../core/services/recipe.service';
import { ErrorService } from '../../../core/services/error.service';
import { Recipe } from '../../../core/models/recipe.model';
import { Page } from '../../../core/models/page.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-my-recipes-page',
  imports: [RouterLink, LoadingSpinnerComponent, TuiButton, TuiError, TuiIcon, TuiCardLarge],
  templateUrl: './my-recipes.page.html',
  styleUrl: './my-recipes.page.css',
})
export class MyRecipesPage implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly errorService = inject(ErrorService);
  private readonly notification = inject(TuiNotificationService);

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
      error: (err) => {
        this.error = this.errorService.extractErrorMessage(err);
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
    const recipeToDelete = this.recipeToDelete;

    if (!recipeToDelete) return;

    this.deleting = true;
    this.recipeService.delete(recipeToDelete.id).subscribe({
      next: () => {
        const deletedRecipeId = recipeToDelete.id;
        this.recipes = this.recipes
          ? {
              ...this.recipes,
              content: this.recipes.content.filter((recipe) => recipe.id !== deletedRecipeId),
            }
          : this.recipes;
        this.showDeleteConfirm = false;
        this.deleting = false;
        this.recipeToDelete = null;
        this.notification
          .open('Рецепт успешно удалён из вашего списка', {
            appearance: 'positive',
            label: 'Рецепт удалён',
            autoClose: 2500,
            closable: false,
          })
          .subscribe();
      },
      error: (err) => {
        this.error = this.errorService.extractErrorMessage(err);
        this.deleting = false;
      },
    });
  }
}
