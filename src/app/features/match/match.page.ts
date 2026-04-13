import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../../core/services/recipe.service';
import { RecipeCategoryService } from '../../core/services/recipe-category.service';
import { RecipeMatch } from '../../core/models/recipe.model';
import { Category } from '../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-match-page',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './match.page.html',
  styleUrl: './match.page.css'
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
