import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiError, TuiInput } from '@taiga-ui/core';
import { TuiSelect } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCardMedium } from '@taiga-ui/layout';
import { UserIngredientService } from '../../core/services/user-ingredient.service';
import { IngredientService } from '../../core/services/ingredient.service';
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
    TuiError,
    TuiInput,
    TuiSelect,
    TuiCardLarge,
    TuiCardMedium,
  ],
  templateUrl: './fridge.page.html',
  styleUrl: './fridge.page.css',
})
export class FridgePage implements OnInit {
  private readonly userIngredients = inject(UserIngredientService);
  private readonly ingredientsApi = inject(IngredientService);

  protected items: UserIngredient[] = [];
  protected units: Unit[] = [];
  protected error = '';

  protected get unitIds(): number[] {
    return this.units.map((u) => u.id);
  }

  protected get unitLabels(): string[] {
    return this.units.map((u) => u.abbreviation || u.name);
  }

  protected form: Partial<UserIngredientRequest> = {
    ingredientId: undefined,
    quantity: 0,
    unitId: undefined,
    expiresAt: undefined,
  };

  ngOnInit() {
    this.load();
    this.loadDictionaries();
  }

  private load() {
    this.userIngredients.listAll().subscribe({
      next: (res) => (this.items = res),
      error: () => (this.error = 'Не удалось загрузить продукты'),
    });
  }

  private loadDictionaries() {
    this.ingredientsApi.units().subscribe((res) => (this.units = res));
  }

  onIngredientSelected(ingredient: Ingredient) {
    this.form.ingredientId = ingredient.id;
  }

  add() {
    if (!this.form.ingredientId || !this.form.quantity) {
      this.error = 'Заполните ингредиент и количество';
      return;
    }
    this.error = '';
    this.userIngredients
      .add({
        ingredientId: this.form.ingredientId,
        quantity: Number(this.form.quantity),
        unitId: this.form.unitId || undefined,
        expiresAt: this.form.expiresAt || undefined,
      })
      .subscribe({
        next: () => {
          this.load();
        },
        error: () => {
          this.error = 'Не удалось сохранить продукт';
        },
      });
  }

  remove(ingredientId: number) {
    this.userIngredients.remove(ingredientId).subscribe({
      next: () => this.load(),
      error: () => (this.error = 'Не удалось удалить продукт'),
    });
  }
}
