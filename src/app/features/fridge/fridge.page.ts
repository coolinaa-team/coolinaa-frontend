import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserIngredientService } from '../../core/services/user-ingredient.service';
import { IngredientService } from '../../core/services/ingredient.service';
import { Ingredient, UserIngredient, UserIngredientRequest } from '../../core/models/ingredient.model';
import { Unit } from '../../core/models/unit.model';
import { IngredientAutocompleteComponent } from '../../shared/ingredient-autocomplete.component';

@Component({
  selector: 'app-fridge-page',
  standalone: true,
  imports: [CommonModule, FormsModule, IngredientAutocompleteComponent],
  template: `
    <section class="fridge-shell space-y-5 mt-4">
      <div class="flex items-center justify-between ">
        <div>
          <p class="text-xs uppercase tracking-wide text-sky-300">🧊 fresh keeper</p>
          <h1 class="text-2xl font-semibold text-white">Мой холодильник</h1>
          <p class="text-sm text-sky-100/90">Следите за запасами и сроками годности.</p>
        </div>
        <div class="flex gap-2 items-center justify-center flex-wrap bg-white/10 px-3 py-2 rounded-xl border border-white/20 shadow-lg">
          <div class="flex flex-col leading-tight text-white/80 text-xs">
            <span>Температура</span>
            <strong class="text-lg text-white">+4°C</strong>
          </div>
        </div>
      </div>

      <div class="frost-panel space-y-4">
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="field">
            <span>Ингредиент</span>
            <app-ingredient-autocomplete 
              variant="dark"
              placeholder="Поиск ингредиентов..."
              (selected)="onIngredientSelected($event)"
            />
          </label>

          <label class="field">
            <span>Количество</span>
            <input class="input" type="number" min="0" step="0.1" [(ngModel)]="form.quantity" />
          </label>

          <label class="field">
            <span>Ед. измерения</span>
            <select class="input" [(ngModel)]="form.unitId">
              <option [ngValue]="undefined">Не выбрано</option>
              <option *ngFor="let u of units" [ngValue]="u.id">{{ u.abbreviation || u.name }}</option>
            </select>
          </label>

          <label class="field">
            <span>Срок годности (опционально)</span>
            <input class="input" type="date" [(ngModel)]="form.expiresAt" />
          </label>
        </div>
        <p *ngIf="error" class="text-sm text-red-200">{{ error }}</p>
        <button class="fridge-button w-full" (click)="add()">Добавить</button>
      </div>

      <div class="frost-panel space-y-3" *ngIf="items.length; else empty">
        <div class="space-y-2">
          <div
            *ngFor="let item of items"
            class="flex items-center justify-between border-b border-white/10 pb-2 last:border-none last:pb-0"
          >
            <div class="leading-tight text-white">
              <p class="font-semibold">{{ item.ingredientName }}</p>
              <p class="text-xs text-sky-100/80">{{ item.quantity || 0 }} {{ item.unitName || '' }}</p>
              <p class="text-xs text-sky-100/60" *ngIf="item.expiresAt">Годен до {{ item.expiresAt | date }}</p>
            </div>
            <button class="text-sm text-rose-100 hover:text-rose-200" (click)="remove(item.ingredientId)">Удалить</button>
          </div>
        </div>
      </div>
      <ng-template #empty>
        <div class="frost-panel text-sm text-sky-100/80">
          Список пуст. Добавьте продукты, чтобы получить рекомендации.
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
  .fridge-shell {
  background: radial-gradient(circle at 20% 20%, rgba(125, 211, 252, 0.25), transparent 32%),
    radial-gradient(circle at 80% 0%, rgba(59, 130, 246, 0.2), transparent 36%),
    linear-gradient(135deg, #0f172a 0%, #0b2a4a 50%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.45);
}

.frost-panel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  padding: 16px;
  backdrop-filter: blur(12px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.88);
}

.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.input:focus {
  outline: 2px solid rgba(125, 211, 252, 0.6);
  outline-offset: 1px;
}

.fridge-button {
  padding: 10px 14px;
  border-radius: 12px;
  background: linear-gradient(120deg, #38bdf8, #0ea5e9);
  color: #fff;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 25px rgba(14, 165, 233, 0.35);
  transition: transform 0.1s ease, box-shadow 0.2s ease;
}

.fridge-button:active {
  transform: translateY(1px);
  box-shadow: 0 6px 15px rgba(14, 165, 233, 0.25);
}
    `
  ]
})
export class FridgePage implements OnInit {
  private readonly userIngredients = inject(UserIngredientService);
  private readonly ingredientsApi = inject(IngredientService);

  protected items: UserIngredient[] = [];
  protected units: Unit[] = [];
  protected error = '';

  protected form: Partial<UserIngredientRequest> = {
    ingredientId: undefined,
    quantity: 0,
    unitId: undefined,
    expiresAt: undefined
  };

  ngOnInit() {
    this.load();
    this.loadDictionaries();
  }

  private load() {
    this.userIngredients.listAll().subscribe({
      next: (res) => (this.items = res),
      error: () => (this.error = 'Не удалось загрузить продукты')
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
    this.userIngredients.add({
      ingredientId: this.form.ingredientId,
      quantity: Number(this.form.quantity),
      unitId: this.form.unitId || undefined,
      expiresAt: this.form.expiresAt || undefined
    }).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        this.error = 'Не удалось сохранить продукт';
      }
    });
  }

  remove(ingredientId: number) {
    this.userIngredients.remove(ingredientId).subscribe({
      next: () => this.load(),
      error: () => (this.error = 'Не удалось удалить продукт')
    });
  }
}
