import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TuiButton, TuiError, TuiIcon } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';
import { FavoriteService } from '../../../core/services/favorite.service';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorService } from '../../../core/services/error.service';
import { Recipe } from '../../../core/models/recipe.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-favorites-page',
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, TuiButton, TuiError, TuiIcon, TuiCardLarge],
  templateUrl: './favorites.page.html',
  styleUrl: './favorites.page.css',
})
export class FavoritesPage implements OnInit {
  private readonly favoriteService = inject(FavoriteService);
  private readonly errorService = inject(ErrorService);
  private readonly auth = inject(AuthService);

  protected recipes: Recipe[] = [];
  protected loading = false;
  protected error = '';
  protected removingId: number | null = null;

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading = true;
    this.error = '';
    this.favoriteService.listForCurrentUser().subscribe({
      next: (res) => {
        this.recipes = res || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = this.errorService.extractErrorMessage(err);
        this.loading = false;
      },
    });
  }

  remove(recipeId: number) {
    this.removingId = recipeId;
    const uid = this.auth.user()?.id;
    if (!uid) {
      this.error = 'Необходимо авторизоваться';
      this.removingId = null;
      return;
    }

    this.favoriteService.remove(uid, recipeId).subscribe({
      next: () => {
        this.recipes = this.recipes.filter((r) => r.id !== recipeId);
        this.removingId = null;
      },
      error: (err) => {
        this.error = this.errorService.extractErrorMessage(err);
        this.removingId = null;
      },
    });
  }
}
