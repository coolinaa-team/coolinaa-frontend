import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiDropdown, TuiError } from '@taiga-ui/core';
import { TuiCalendar } from '@taiga-ui/core';
import { TuiNotification } from '@taiga-ui/core/components/notification';
import {
  TuiChevron,
  TuiDataListWrapper,
  TuiInputDate,
  TuiInputNumber,
  TuiSelect,
} from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { TuiDay } from '@taiga-ui/cdk';
import { UserIngredientService } from '../../core/services/user-ingredient.service';
import { IngredientService } from '../../core/services/ingredient.service';
import { ErrorService } from '../../core/services/error.service';
import {
  Ingredient,
  UserIngredient,
  UserIngredientRequest,
} from '../../core/models/ingredient.model';
import { Unit } from '../../core/models/unit.model';
import { IngredientAutocompleteComponent } from '../../shared/ingredient-autocomplete/ingredient-autocomplete.component';

@Component({
  selector: 'app-fridge-page',
  imports: [
    CommonModule,
    FormsModule,
    IngredientAutocompleteComponent,
    TuiButton,
    TuiCalendar,
    TuiChevron,
    TuiDataListWrapper,
    TuiDropdown,
    TuiError,
    TuiInputDate,
    TuiInputNumber,
    TuiNotification,
    TuiSelect,
    TuiCardLarge,
  ],
  templateUrl: './fridge.page.html',
  styleUrl: './fridge.page.css',
})
export class FridgePage implements OnInit {
  private readonly userIngredients = inject(UserIngredientService);
  private readonly ingredientsApi = inject(IngredientService);
  private readonly errorService = inject(ErrorService);

  protected items: UserIngredient[] = [];
  protected units: Unit[] = [];
  protected error = '';
  protected successNotification = false;
  protected deletingIngredientIds = new Set<number>();

  protected get unitIds(): number[] {
    return this.units.map((u) => u.id);
  }

  protected get unitLabels(): string[] {
    return this.units.map((u) => u.abbreviation || u.name);
  }

  protected readonly stringifyUnit = (id: number | null): string => {
    if (id === null) {
      return '';
    }

    return (
      this.units.find((unit) => unit.id === id)?.abbreviation ||
      this.units.find((unit) => unit.id === id)?.name ||
      ''
    );
  };

  protected form: {
    ingredientId?: number;
    quantity: string;
    unitId?: number;
    expiresAt: TuiDay | null;
  } = {
    ingredientId: undefined,
    quantity: '',
    unitId: undefined,
    expiresAt: null,
  };

  ngOnInit() {
    this.load();
    this.loadDictionaries();
  }

  private load() {
    this.userIngredients.listAll().subscribe({
      next: (res) => (this.items = res),
      error: (err) => (this.error = this.errorService.extractErrorMessage(err)),
    });
  }

  private loadDictionaries() {
    this.ingredientsApi.units().subscribe((res) => (this.units = res));
  }

  onIngredientSelected(ingredient: Ingredient) {
    this.form.ingredientId = ingredient.id;
  }

  add() {
    const quantity = Number(this.form.quantity);

    if (!this.form.ingredientId || !this.form.quantity) {
      this.error = 'Укажите ингредиент и количество';
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.error = 'Количество должно быть положительным числом';
      return;
    }

    this.error = '';
    this.userIngredients
      .add({
        ingredientId: this.form.ingredientId,
        quantity,
        unitId: this.form.unitId || undefined,
        expiresAt: this.form.expiresAt?.toJSON() || undefined,
      })
      .subscribe({
        next: () => {
          this.load();
          this.form.quantity = '';
          this.form.unitId = undefined;
          this.form.expiresAt = null;
          this.successNotification = false;
          queueMicrotask(() => {
            this.successNotification = true;
          });
        },
        error: (err) => {
          this.error = this.errorService.extractErrorMessage(err);
        },
      });
  }

  remove(ingredientId: number) {
    if (this.deletingIngredientIds.has(ingredientId)) {
      return;
    }

    const previousItems = this.items;
    this.error = '';
    this.deletingIngredientIds.add(ingredientId);
    this.items = this.items.filter((item) => item.ingredientId !== ingredientId);

    this.userIngredients.remove(ingredientId).subscribe({
      next: () => {
        this.deletingIngredientIds.delete(ingredientId);
        this.load();
      },
      error: (err) => {
        this.deletingIngredientIds.delete(ingredientId);
        this.items = previousItems;
        this.error = this.errorService.extractErrorMessage(err);
      },
    });
  }
}
