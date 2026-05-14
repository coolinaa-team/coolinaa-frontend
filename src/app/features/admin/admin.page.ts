import { Component, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { TuiButton, TuiCheckbox, TuiDropdown, TuiInput } from '@taiga-ui/core';
import { TuiChevron, TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { Category } from '../../core/models/category.model';
import { Ingredient } from '../../core/models/ingredient.model';
import { Unit } from '../../core/models/unit.model';
import { IngredientCategoryService } from '../../core/services/ingredient-category.service';
import { IngredientService } from '../../core/services/ingredient.service';
import { UnitService } from '../../core/services/unit.service';
import { RecipeCategoryService } from '../../core/services/recipe-category.service';

interface EditState<T> {
  [id: number]: Partial<T> & { editing?: boolean };
}

@Component({
  selector: 'app-admin-page',
  imports: [
    FormsModule,
    TuiButton,
    TuiCheckbox,
    TuiInput,
    TuiDropdown,
    TuiSelect,
    TuiChevron,
    TuiDataListWrapper,
    TuiCardLarge,
  ],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.css',
})
export class AdminPage implements OnInit {
  private readonly ingCatApi = inject(IngredientCategoryService);
  private readonly ingApi = inject(IngredientService);
  private readonly unitApi = inject(UnitService);
  private readonly recCatApi = inject(RecipeCategoryService);

  protected ingredientCategories: Category[] = [];
  protected recipeCategories: Category[] = [];
  protected units: Unit[] = [];
  protected ingredients: Ingredient[] = [];

  protected newIngCat: { name?: string; description?: string } = {};
  protected newIngredient: { name?: string; description?: string; categoryId?: number } = {};
  protected newUnit: { name?: string; abbreviation?: string; isMetric?: boolean } = {
    isMetric: true,
  };
  protected newRecCat: { name?: string; description?: string } = {};

  protected editIngCat: EditState<Category> = {};
  protected editIngredient: EditState<Ingredient> = {};
  protected editUnit: EditState<Unit> = {};
  protected editRecCat: EditState<Category> = {};

  protected get ingredientCategoryIds(): number[] {
    return this.ingredientCategories.map((c) => c.id);
  }

  protected readonly stringifyIngredientCategory = (id: number | null | undefined): string => {
    if (id === null || id === undefined) return '';

    return this.ingredientCategories.find((c) => c.id === id)?.name ?? '';
  };

  ngOnInit() {
    this.loadAll();
  }

  private loadAll() {
    this.ingCatApi.list().subscribe((res) => (this.ingredientCategories = res));
    this.ingApi.list({ size: 200 }).subscribe((res) => (this.ingredients = res.content));
    this.unitApi.list().subscribe((res) => (this.units = res));
    this.recCatApi.list().subscribe((res) => (this.recipeCategories = res));
  }

  addIngredientCategory() {
    if (!this.newIngCat.name) return;
    this.ingCatApi
      .create(this.newIngCat as { name: string; description?: string })
      .subscribe(() => {
        this.newIngCat = {};
        this.ingCatApi.list().subscribe((res) => (this.ingredientCategories = res));
      });
  }

  startEditIngCat(cat: Category) {
    this.editIngCat[cat.id] = { ...cat, editing: true };
  }

  cancelIngCat(id: number) {
    delete this.editIngCat[id];
  }

  saveIngredientCategory(id: number) {
    const data = this.editIngCat[id];
    if (!data?.name) return;
    this.ingCatApi.update(id, { name: data.name, description: data.description }).subscribe(() => {
      delete this.editIngCat[id];
      this.ingCatApi.list().subscribe((res) => (this.ingredientCategories = res));
    });
  }

  deleteIngredientCategory(id: number) {
    this.ingCatApi.delete(id).subscribe(() => {
      this.ingredientCategories = this.ingredientCategories.filter((c) => c.id !== id);
    });
  }

  addIngredient() {
    if (!this.newIngredient.name) return;
    this.ingApi
      .create(this.newIngredient as { name: string; description?: string; categoryId?: number })
      .subscribe(() => {
        this.newIngredient = {};
        this.ingApi.list({ size: 200 }).subscribe((res) => (this.ingredients = res.content));
      });
  }

  startEditIngredient(ing: Ingredient) {
    this.editIngredient[ing.id] = { ...ing, editing: true };
  }

  cancelIngredient(id: number) {
    delete this.editIngredient[id];
  }

  saveIngredient(id: number) {
    const data = this.editIngredient[id];
    if (!data) return;
    this.ingApi
      .update(id, {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        isActive: data.isActive,
      })
      .subscribe(() => {
        delete this.editIngredient[id];
        this.ingApi.list({ size: 200 }).subscribe((res) => (this.ingredients = res.content));
      });
  }

  deleteIngredient(id: number) {
    this.ingApi.delete(id).subscribe(() => {
      this.ingredients = this.ingredients.filter((i) => i.id !== id);
    });
  }

  addUnit() {
    if (!this.newUnit.name) return;
    this.unitApi
      .create(this.newUnit as { name: string; abbreviation?: string; isMetric?: boolean })
      .subscribe(() => {
        this.newUnit = { isMetric: true };
        this.unitApi.list().subscribe((res) => (this.units = res));
      });
  }

  startEditUnit(u: Unit) {
    this.editUnit[u.id] = { ...u, editing: true };
  }

  cancelUnit(id: number) {
    delete this.editUnit[id];
  }

  saveUnit(id: number) {
    const data = this.editUnit[id];
    if (!data) return;
    this.unitApi
      .update(id, { name: data.name, abbreviation: data.abbreviation, isMetric: data.isMetric })
      .subscribe(() => {
        delete this.editUnit[id];
        this.unitApi.list().subscribe((res) => (this.units = res));
      });
  }

  deleteUnit(id: number) {
    this.unitApi.delete(id).subscribe(() => {
      this.units = this.units.filter((u) => u.id !== id);
    });
  }

  addRecipeCategory() {
    if (!this.newRecCat.name) return;
    this.recCatApi
      .create(this.newRecCat as { name: string; description?: string })
      .subscribe(() => {
        this.newRecCat = {};
        this.recCatApi.list().subscribe((res) => (this.recipeCategories = res));
      });
  }

  startEditRecCat(cat: Category) {
    this.editRecCat[cat.id] = { ...cat, editing: true };
  }

  cancelRecCat(id: number) {
    delete this.editRecCat[id];
  }

  saveRecipeCategory(id: number) {
    const data = this.editRecCat[id];
    if (!data?.name) return;
    this.recCatApi.update(id, { name: data.name, description: data.description }).subscribe(() => {
      delete this.editRecCat[id];
      this.recCatApi.list().subscribe((res) => (this.recipeCategories = res));
    });
  }

  deleteRecipeCategory(id: number) {
    this.recCatApi.delete(id).subscribe(() => {
      this.recipeCategories = this.recipeCategories.filter((c) => c.id !== id);
    });
  }
}
