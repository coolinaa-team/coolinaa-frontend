import { Component, OnInit, inject } from '@angular/core';

import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiButton, TuiDropdown, TuiError, TuiInput } from '@taiga-ui/core';
import { TuiChevron, TuiDataListWrapper, TuiSelect, TuiTextarea } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { IngredientService } from '../../../core/services/ingredient.service';
import { RecipeService } from '../../../core/services/recipe.service';
import { RecipeCategoryService } from '../../../core/services/recipe-category.service';
import { Ingredient } from '../../../core/models/ingredient.model';
import { Unit } from '../../../core/models/unit.model';
import { Category } from '../../../core/models/category.model';
import { RecipeCreateRequest } from '../../../core/models/recipe.model';
import { IngredientAutocompleteComponent } from '../../../shared/ingredient-autocomplete/ingredient-autocomplete.component';

@Component({
  selector: 'app-recipe-create-page',
  imports: [
    ReactiveFormsModule,
    IngredientAutocompleteComponent,
    TuiInput,
    TuiTextarea,
    TuiChevron,
    TuiDataListWrapper,
    TuiDropdown,
    TuiSelect,
    TuiButton,
    TuiError,
    TuiCardLarge,
  ],
  templateUrl: './recipe-create.page.html',
  styleUrl: './recipe-create.page.css',
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

  protected get categoryIds(): number[] {
    return this.categories.map((c) => c.id);
  }

  protected get categoryLabels(): string[] {
    return this.categories.map((c) => c.name);
  }

  protected get unitIds(): number[] {
    return this.units.map((u) => u.id);
  }

  protected get unitLabels(): string[] {
    return this.units.map((u) => u.abbreviation || u.name);
  }

  protected readonly stringifyCategory = (id: number | null): string => {
    if (id === null) return '';

    return this.categories.find((c) => c.id === id)?.name ?? '';
  };

  protected readonly stringifyUnit = (id: number | null): string => {
    if (id === null) return '';

    const unit = this.units.find((u) => u.id === id);

    return unit ? unit.abbreviation || unit.name : '';
  };

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
    ingredients: this.fb.array([]),
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
        orderIndex: [this.ingredientsArray.length],
      }),
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
      },
    });
  }
}
