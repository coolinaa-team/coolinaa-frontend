import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-stone-500">Admin</p>
          <h1 class="text-2xl font-semibold">Управление справочниками</h1>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Категории ингредиентов</h2>
          </div>
          <div class="flex gap-2 flex-wrap">
            <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" placeholder="Название" [(ngModel)]="newIngCat.name" />
            <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" placeholder="Описание" [(ngModel)]="newIngCat.description" />
            <button class="px-3 py-2 rounded-lg bg-accent-600 text-white text-sm font-semibold" (click)="addIngredientCategory()">Добавить</button>
          </div>
          <div class="divide-y divide-stone-100">
            <div *ngFor="let c of ingredientCategories" class="py-2 flex items-center gap-2">
              <ng-container *ngIf="editIngCat[c.id]?.editing; else ingCatView">
                <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" [(ngModel)]="editIngCat[c.id].name" />
                <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" [(ngModel)]="editIngCat[c.id].description" />
                <button class="px-3 py-2 rounded-lg bg-accent-600 text-white text-sm font-semibold" (click)="saveIngredientCategory(c.id)">Сохранить</button>
                <button class="text-sm text-accent-700" (click)="cancelIngCat(c.id)">Отмена</button>
              </ng-container>
              <ng-template #ingCatView>
                <div class="flex-1">
                  <p class="font-semibold">{{ c.name }}</p>
                  <p class="text-sm text-stone-500" *ngIf="c.description">{{ c.description }}</p>
                </div>
                <button class="text-sm text-accent-700" (click)="startEditIngCat(c)">Изменить</button>
                <button class="text-sm text-red-600" (click)="deleteIngredientCategory(c.id)">Удалить</button>
              </ng-template>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Ингредиенты</h2>
          </div>
          <div class="flex gap-2 flex-wrap">
            <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" placeholder="Название" [(ngModel)]="newIngredient.name" />
            <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" placeholder="Описание" [(ngModel)]="newIngredient.description" />
            <select class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" [(ngModel)]="newIngredient.categoryId">
              <option [ngValue]="undefined">Категория</option>
              <option *ngFor="let c of ingredientCategories" [ngValue]="c.id">{{ c.name }}</option>
            </select>
            <button class="px-3 py-2 rounded-lg bg-accent-600 text-white text-sm font-semibold" (click)="addIngredient()">Добавить</button>
          </div>
          <div class="divide-y divide-stone-100">
            <div *ngFor="let ing of ingredients" class="py-2 flex items-center gap-2">
              <ng-container *ngIf="editIngredient[ing.id]?.editing; else ingView">
                <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" [(ngModel)]="editIngredient[ing.id].name" />
                <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" [(ngModel)]="editIngredient[ing.id].description" />
                <select class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" [(ngModel)]="editIngredient[ing.id].categoryId">
                  <option [ngValue]="undefined">Категория</option>
                  <option *ngFor="let c of ingredientCategories" [ngValue]="c.id">{{ c.name }}</option>
                </select>
                <label class="flex items-center gap-1 text-sm text-stone-700">
                  <input type="checkbox" [(ngModel)]="editIngredient[ing.id].isActive" /> Активен
                </label>
                <button class="px-3 py-2 rounded-lg bg-accent-600 text-white text-sm font-semibold" (click)="saveIngredient(ing.id)">Сохранить</button>
                <button class="text-sm text-accent-700" (click)="cancelIngredient(ing.id)">Отмена</button>
              </ng-container>
              <ng-template #ingView>
                <div class="flex-1">
                  <p class="font-semibold">{{ ing.name }}</p>
                  <p class="text-sm text-stone-500" *ngIf="ing.description">{{ ing.description }}</p>
                  <p class="text-xs text-stone-400" *ngIf="ing.categoryName">{{ ing.categoryName }}</p>
                </div>
                <button class="text-sm text-accent-700" (click)="startEditIngredient(ing)">Изменить</button>
                <button class="text-sm text-red-600" (click)="deleteIngredient(ing.id)">Удалить</button>
              </ng-template>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Единицы измерения</h2>
          </div>
          <div class="flex gap-2 flex-wrap">
            <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" placeholder="Название" [(ngModel)]="newUnit.name" />
            <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" placeholder="Сокращение" [(ngModel)]="newUnit.abbreviation" />
            <label class="flex items-center gap-1 text-sm text-stone-700">
              <input type="checkbox" [(ngModel)]="newUnit.isMetric" /> Метрическая
            </label>
            <button class="px-3 py-2 rounded-lg bg-accent-600 text-white text-sm font-semibold" (click)="addUnit()">Добавить</button>
          </div>
          <div class="divide-y divide-stone-100">
            <div *ngFor="let u of units" class="py-2 flex items-center gap-2">
              <ng-container *ngIf="editUnit[u.id]?.editing; else unitView">
                <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" [(ngModel)]="editUnit[u.id].name" />
                <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" [(ngModel)]="editUnit[u.id].abbreviation" />
                <label class="flex items-center gap-1 text-sm text-stone-700">
                  <input type="checkbox" [(ngModel)]="editUnit[u.id].isMetric" /> Метрическая
                </label>
                <button class="px-3 py-2 rounded-lg bg-accent-600 text-white text-sm font-semibold" (click)="saveUnit(u.id)">Сохранить</button>
                <button class="text-sm text-accent-700" (click)="cancelUnit(u.id)">Отмена</button>
              </ng-container>
              <ng-template #unitView>
                <div class="flex-1">
                  <p class="font-semibold">{{ u.name }} <span class="text-stone-500" *ngIf="u.abbreviation">({{ u.abbreviation }})</span></p>
                  <p class="text-xs text-stone-500">{{ u.isMetric ? 'Метрическая' : 'Имперская' }}</p>
                </div>
                <button class="text-sm text-accent-700" (click)="startEditUnit(u)">Изменить</button>
                <button class="text-sm text-red-600" (click)="deleteUnit(u.id)">Удалить</button>
              </ng-template>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Категории рецептов</h2>
          </div>
          <div class="flex gap-2 flex-wrap">
            <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" placeholder="Название" [(ngModel)]="newRecCat.name" />
            <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" placeholder="Описание" [(ngModel)]="newRecCat.description" />
            <button class="px-3 py-2 rounded-lg bg-accent-600 text-white text-sm font-semibold" (click)="addRecipeCategory()">Добавить</button>
          </div>
          <div class="divide-y divide-stone-100">
            <div *ngFor="let c of recipeCategories" class="py-2 flex items-center gap-2">
              <ng-container *ngIf="editRecCat[c.id]?.editing; else recCatView">
                <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" [(ngModel)]="editRecCat[c.id].name" />
                <input class="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white" [(ngModel)]="editRecCat[c.id].description" />
                <button class="px-3 py-2 rounded-lg bg-accent-600 text-white text-sm font-semibold" (click)="saveRecipeCategory(c.id)">Сохранить</button>
                <button class="text-sm text-accent-700" (click)="cancelRecCat(c.id)">Отмена</button>
              </ng-container>
              <ng-template #recCatView>
                <div class="flex-1">
                  <p class="font-semibold">{{ c.name }}</p>
                  <p class="text-sm text-stone-500" *ngIf="c.description">{{ c.description }}</p>
                </div>
                <button class="text-sm text-accent-700" (click)="startEditRecCat(c)">Изменить</button>
                <button class="text-sm text-red-600" (click)="deleteRecipeCategory(c.id)">Удалить</button>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
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
  protected newUnit: { name?: string; abbreviation?: string; isMetric?: boolean } = { isMetric: true };
  protected newRecCat: { name?: string; description?: string } = {};

  protected editIngCat: EditState<Category> = {};
  protected editIngredient: EditState<Ingredient> = {};
  protected editUnit: EditState<Unit> = {};
  protected editRecCat: EditState<Category> = {};

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
    this.ingCatApi.create(this.newIngCat as { name: string; description?: string }).subscribe(() => {
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
    this.ingApi.create(this.newIngredient as { name: string; description?: string; categoryId?: number }).subscribe(() => {
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
        isActive: data.isActive
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
    this.unitApi.create(this.newUnit as { name: string; abbreviation?: string; isMetric?: boolean }).subscribe(() => {
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
    this.recCatApi.create(this.newRecCat as { name: string; description?: string }).subscribe(() => {
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
