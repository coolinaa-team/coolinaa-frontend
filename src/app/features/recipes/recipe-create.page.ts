import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IngredientService } from '../../core/services/ingredient.service';
import { RecipeService } from '../../core/services/recipe.service';
import { RecipeCategoryService } from '../../core/services/recipe-category.service';
import { Ingredient } from '../../core/models/ingredient.model';
import { Unit } from '../../core/models/unit.model';
import { Category } from '../../core/models/category.model';
import { RecipeCreateRequest } from '../../core/models/recipe.model';
import { IngredientAutocompleteComponent } from '../../shared/ingredient-autocomplete.component';

@Component({
  selector: 'app-recipe-create-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IngredientAutocompleteComponent],
  template: `
    <section class="space-y-4">
      <div>
        <h1 class="text-2xl font-semibold">Создать рецепт</h1>
        <p class="text-sm text-stone-500">Поделитесь любимым блюдом с сообществом.</p>
      </div>
      <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="space-y-1 text-sm text-stone-700">
            <span>Название</span>
            <input class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2" formControlName="title" />
          </label>
          <label class="space-y-1 text-sm text-stone-700">
            <span>Категория</span>
            <select class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2" formControlName="categoryId">
              <option [ngValue]="null">Не выбрано</option>
              <option *ngFor="let cat of categories" [ngValue]="cat.id">{{ cat.name }}</option>
            </select>
          </label>
          <label class="space-y-1 text-sm text-stone-700 sm:col-span-2">
            <span>Описание</span>
            <textarea class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2" rows="2" formControlName="description"></textarea>
          </label>
          <label class="space-y-1 text-sm text-stone-700 sm:col-span-2">
            <span>Инструкции</span>
            <textarea class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2" rows="4" formControlName="instructions"></textarea>
          </label>
          <label class="space-y-1 text-sm text-stone-700">
            <span>Время подготовки (мин)</span>
            <input type="number" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2" formControlName="preparationTime" />
          </label>
          <label class="space-y-1 text-sm text-stone-700">
            <span>Время готовки (мин)</span>
            <input type="number" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2" formControlName="cookingTime" />
          </label>
          <label class="space-y-1 text-sm text-stone-700">
            <span>Порции</span>
            <input type="number" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2" formControlName="servings" />
          </label>
          <label class="space-y-1 text-sm text-stone-700">
            <span>Сложность (1-5)</span>
            <input type="number" min="1" max="5" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2" formControlName="difficultyLevel" />
          </label>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-stone-800">Ингредиенты</p>
            <button type="button" class="text-sm text-accent-800" (click)="addIngredient()">Добавить</button>
          </div>
          <div class="space-y-3" formArrayName="ingredients">
            <div
              *ngFor="let group of ingredientsArray.controls; let i = index"
              [formGroupName]="i"
              class="rounded-xl border border-stone-200 bg-white/90 p-3 grid gap-2 sm:grid-cols-4 shadow-sm"
            >
              <label class="space-y-1 text-sm text-stone-700 sm:col-span-1">
                <app-ingredient-autocomplete 
                  placeholder="Ингредиент..."
                  (selected)="onIngredientSelectedInForm($event, i)"
                />
              </label>
              <input type="number" min="0" step="0.1" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2" formControlName="quantity" placeholder="Количество" />
              <select class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2" formControlName="unitId">
                <option [ngValue]="null">Ед.</option>
                <option *ngFor="let u of units" [ngValue]="u.id">{{ u.abbreviation || u.name }}</option>
              </select>
              <div class="flex items-center gap-2">
                <input class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2" formControlName="notes" placeholder="Примечание" />
                <button type="button" class="text-sm text-red-500" (click)="removeIngredient(i)">✕</button>
              </div>
            </div>
          </div>
        </div>

        <p *ngIf="error" class="text-sm text-red-500">{{ error }}</p>
        <button
          type="submit"
          class="w-full sm:w-auto px-4 py-2 rounded-xl bg-accent-600 text-white font-semibold disabled:opacity-60"
          [disabled]="form.invalid || loading"
        >
          {{ loading ? 'Сохраняем...' : 'Сохранить рецепт' }}
        </button>
      </form>
    </section>
  `
})
export class RecipeCreatePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ingredientsApi = inject(IngredientService);
  private readonly categoriesApi = inject(RecipeCategoryService);
  private readonly recipesApi = inject(RecipeService);
  private readonly router = inject(Router);

  protected ingredientsDict: Ingredient[] = [];
  protected units: Unit[] = [];
  protected categories: Category[] = [];
  protected loading = false;
  protected error = '';

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    instructions: ['', Validators.required],
    preparationTime: [null],
    cookingTime: [null],
    difficultyLevel: [null],
    servings: [null],
    imageUrl: [''],
    categoryId: [null],
    ingredients: this.fb.array([])
  });

  ngOnInit() {
    this.addIngredient();
    this.loadDictionaries();
  }

  get ingredientsArray(): FormArray {
    return this.form.get('ingredients') as FormArray;
  }

  addIngredient() {
    this.ingredientsArray.push(
      this.fb.group({
        ingredientId: [null, Validators.required],
        quantity: [0, Validators.required],
        unitId: [null],
        notes: [''],
        orderIndex: [this.ingredientsArray.length]
      })
    );
  }

  removeIngredient(index: number) {
    this.ingredientsArray.removeAt(index);
  }

  onIngredientSelectedInForm(ingredient: Ingredient, index: number) {
    const control = this.ingredientsArray.at(index);
    if (control) {
      control.patchValue({ ingredientId: ingredient.id });
    }
  }

  private loadDictionaries() {
    this.ingredientsApi.units().subscribe((res) => (this.units = res));
    this.categoriesApi.list().subscribe((res) => (this.categories = res));
  }

  submit() {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const payload = this.form.value as RecipeCreateRequest;
    this.recipesApi.create(payload).subscribe({
      next: (recipe) => {
        this.loading = false;
        this.router.navigate(['/recipes', recipe.id]);
      },
      error: () => {
        this.loading = false;
        this.error = 'Не удалось сохранить рецепт';
      }
    });
  }
}
