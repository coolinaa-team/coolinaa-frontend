import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiError, TuiInput } from '@taiga-ui/core';
import { TuiCardLarge, TuiCardMedium } from '@taiga-ui/layout';
import { RecipeService } from '../../../core/services/recipe.service';
import { RecipeCategoryService } from '../../../core/services/recipe-category.service';
import { ErrorService } from '../../../core/services/error.service';
import { Recipe } from '../../../core/models/recipe.model';
import { Page } from '../../../core/models/page.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-recipe-list-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TuiButton,
    TuiError,
    TuiInput,
    TuiCardLarge,
    TuiCardMedium,
  ],
  templateUrl: './recipe-list.page.html',
  styleUrl: './recipe-list.page.css',
})
export class RecipeListPage implements OnInit {
  private readonly recipesApi = inject(RecipeService);
  private readonly categoriesApi = inject(RecipeCategoryService);
  private readonly errorService = inject(ErrorService);

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
      error: () => (this.categories = []),
    });
  }

  load(page = 0) {
    this.loading = true;
    this.error = '';
    this.recipesApi
      .list({
        page,
        search: this.query || undefined,
        categoryId: this.selectedCategory || undefined,
      })
      .subscribe({
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

  protected selectCategory(tag: number | null) {
    this.selectedCategory = tag;
    this.load();
  }
}
