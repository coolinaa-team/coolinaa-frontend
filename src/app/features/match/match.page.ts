import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TuiError } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';
import { RecipeService } from '../../core/services/recipe.service';
import { ErrorService } from '../../core/services/error.service';
import { RecipeMatch } from '../../core/models/recipe.model';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { AuthenticatedImageDirective } from '../../shared/authenticated-image.directive';

@Component({
  selector: 'app-match-page',
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    TuiError,
    TuiCardLarge,
    AuthenticatedImageDirective,
  ],
  templateUrl: './match.page.html',
  styleUrl: './match.page.css',
})
export class MatchPage implements OnInit {
  private readonly recipes = inject(RecipeService);
  private readonly errorService = inject(ErrorService);

  private matches: RecipeMatch[] = [];
  protected viewMatches: RecipeMatch[] = [];
  protected loading = false;
  protected error = '';
  private readonly maxMissing = 3;

  ngOnInit() {
    this.load();
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
      error: (err) => {
        this.error = this.errorService.extractErrorMessage(err);
        this.loading = false;
      },
    });
  }

  private applyFilters() {
    const filtered = this.matches.filter(
      (item) => (item.missingIngredients?.length ?? 0) <= this.maxMissing,
    );

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
