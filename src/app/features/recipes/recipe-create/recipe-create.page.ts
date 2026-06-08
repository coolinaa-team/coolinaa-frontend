import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiButton, TuiDropdown, TuiError, TuiInput } from '@taiga-ui/core';
import { TuiChevron, TuiDataListWrapper, TuiSelect, TuiTextarea } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { switchMap } from 'rxjs';
import { IngredientService } from '../../../core/services/ingredient.service';
import { RecipeService } from '../../../core/services/recipe.service';
import { RecipeCategoryService } from '../../../core/services/recipe-category.service';
import { ErrorService } from '../../../core/services/error.service';
import { FileService } from '../../../core/services/file.service';
import { Ingredient } from '../../../core/models/ingredient.model';
import { Unit } from '../../../core/models/unit.model';
import { Category } from '../../../core/models/category.model';
import {
  Recipe,
  RecipeCreateRequest,
  RecipeIngredientCreate,
} from '../../../core/models/recipe.model';
import { IngredientAutocompleteComponent } from '../../../shared/ingredient-autocomplete/ingredient-autocomplete.component';
import { AuthenticatedImageDirective } from '../../../shared/authenticated-image.directive';

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
    AuthenticatedImageDirective,
  ],
  templateUrl: './recipe-create.page.html',
  styleUrl: './recipe-create.page.css',
})
export class RecipeCreatePage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly ingredientsApi = inject(IngredientService);
  private readonly categoriesApi = inject(RecipeCategoryService);
  private readonly recipesApi = inject(RecipeService);
  private readonly filesApi = inject(FileService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly errorService = inject(ErrorService);

  protected ingredientsDict: Ingredient[] = [];
  protected units: Unit[] = [];
  protected categories: Category[] = [];
  protected loading = false;
  protected error = '';
  protected selectedImageFile: File | null = null;
  protected imagePreviewUrl = '';
  protected existingImageUrl = '';
  protected imageFileName = '';
  protected isEditMode = false;
  private recipeId: number | null = null;

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
    instructions: ['', [Validators.required, Validators.minLength(10)]],
    preparationTime: [null, Validators.min(1)],
    cookingTime: [null, Validators.min(1)],
    difficultyLevel: [null, [Validators.min(1), Validators.max(5)]],
    servings: [null, Validators.min(1)],
    imageUrl: [''],
    categoryId: [null],
    ingredients: this.fb.array([]),
  });

  ngOnInit() {
    this.recipeId = Number(this.route.snapshot.paramMap.get('id')) || null;
    this.isEditMode = !!this.recipeId;
    this.loadDictionaries();

    if (this.recipeId) {
      this.loadRecipe(this.recipeId);
    } else {
      this.addIngredient();
    }
  }

  ngOnDestroy() {
    this.clearImagePreview();
  }

  get ingredientsArray(): FormArray {
    return this.form.get('ingredients') as FormArray;
  }

  addIngredient(initial?: Partial<RecipeIngredientCreate> & { ingredientName?: string }) {
    this.ingredientsArray.push(
      this.fb.group({
        ingredientId: [initial?.ingredientId ?? null, Validators.required],
        ingredientName: [initial?.ingredientName ?? ''],
        quantity: [initial?.quantity ?? null, [Validators.required, Validators.min(0.01)]],
        unitId: [initial?.unitId ?? null],
        notes: [initial?.notes ?? ''],
        orderIndex: [initial?.orderIndex ?? this.ingredientsArray.length],
      }),
    );
  }

  removeIngredient(index: number) {
    this.ingredientsArray.removeAt(index);
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error = 'Можно загрузить только изображение';
      input.value = '';
      return;
    }

    this.clearImagePreview();
    this.error = '';
    this.selectedImageFile = file;
    this.imageFileName = file.name;
    this.imagePreviewUrl = URL.createObjectURL(file);
    this.form.patchValue({ imageUrl: '' });
    this.existingImageUrl = '';
  }

  clearSelectedImage(input?: HTMLInputElement) {
    this.selectedImageFile = null;
    this.imageFileName = '';
    this.clearImagePreview();
    this.existingImageUrl = '';
    this.form.patchValue({ imageUrl: '' });

    if (input) {
      input.value = '';
    }
  }

  onIngredientSelectedInForm(ingredient: Ingredient, index: number) {
    const control = this.ingredientsArray.at(index);
    if (control) {
      control.patchValue({ ingredientId: ingredient.id, ingredientName: ingredient.name });
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

    if (this.hasDuplicateIngredients()) {
      this.error = 'В рецепте не должно быть одинаковых ингредиентов';
      return;
    }

    this.loading = true;
    this.error = '';

    const saveRecipe = (imageUrl?: string) => {
      const payload = this.buildPayload(imageUrl);

      return this.isEditMode && this.recipeId
        ? this.recipesApi.update(this.recipeId, payload)
        : this.recipesApi.create(payload);
    };

    const request$ = this.selectedImageFile
      ? this.filesApi
          .upload(this.selectedImageFile)
          .pipe(switchMap((file) => saveRecipe(this.filesApi.getFileUrl(file.id))))
      : saveRecipe();

    request$.subscribe({
      next: (recipe) => {
        this.loading = false;
        this.router.navigate(['/recipes', recipe.id]);
      },
      error: (err) => {
        this.loading = false;
        this.error = this.errorService.extractErrorMessage(err);
      },
    });
  }

  private clearImagePreview() {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = '';
    }
  }

  private loadRecipe(id: number) {
    this.loading = true;
    this.error = '';

    this.recipesApi.get(id).subscribe({
      next: (recipe) => {
        this.patchRecipe(recipe);
        this.loading = false;
      },
      error: (err) => {
        this.error = this.errorService.extractErrorMessage(err);
        this.loading = false;
      },
    });
  }

  private patchRecipe(recipe: Recipe) {
    this.form.patchValue({
      title: recipe.title,
      description: recipe.description ?? '',
      instructions: recipe.instructions,
      preparationTime: recipe.preparationTime ?? null,
      cookingTime: recipe.cookingTime ?? null,
      difficultyLevel: recipe.difficultyLevel ?? null,
      servings: recipe.servings ?? null,
      imageUrl: recipe.imageUrl ?? '',
      categoryId: recipe.categoryId ?? null,
    });

    this.existingImageUrl = recipe.imageUrl ?? '';
    this.ingredientsArray.clear();

    if (recipe.ingredients?.length) {
      recipe.ingredients.forEach((ingredient, index) => {
        this.addIngredient({
          ingredientId: ingredient.ingredientId,
          ingredientName: ingredient.ingredientName ?? '',
          quantity: ingredient.quantity,
          unitId: ingredient.unitId,
          notes: ingredient.notes,
          orderIndex: ingredient.orderIndex ?? index,
        });
      });
      return;
    }

    this.addIngredient();
  }

  private buildPayload(imageUrl?: string): RecipeCreateRequest {
    const raw = this.form.value as RecipeCreateRequest & {
      ingredients: Array<RecipeIngredientCreate & { ingredientName?: string }>;
    };

    return {
      title: raw.title,
      description: raw.description || undefined,
      instructions: raw.instructions,
      preparationTime: raw.preparationTime || undefined,
      cookingTime: raw.cookingTime || undefined,
      difficultyLevel: raw.difficultyLevel || undefined,
      servings: raw.servings || undefined,
      imageUrl: (imageUrl ?? raw.imageUrl) || undefined,
      categoryId: raw.categoryId || undefined,
      ingredients: raw.ingredients.map((ingredient, index) => ({
        ingredientId: ingredient.ingredientId,
        quantity: ingredient.quantity,
        unitId: ingredient.unitId || undefined,
        notes: ingredient.notes || undefined,
        orderIndex: index,
      })),
    };
  }

  private hasDuplicateIngredients(): boolean {
    const ingredientIds = this.ingredientsArray.controls
      .map((control) => control.get('ingredientId')?.value)
      .filter((id): id is number => typeof id === 'number');

    return new Set(ingredientIds).size !== ingredientIds.length;
  }
}
