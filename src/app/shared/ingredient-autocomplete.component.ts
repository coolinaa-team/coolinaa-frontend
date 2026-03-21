import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { IngredientService } from '../core/services/ingredient.service';
import { Ingredient } from '../core/models/ingredient.model';

@Component({
  selector: 'app-ingredient-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <input
        type="text"
        [(ngModel)]="searchText"
        (ngModelChange)="onSearch($event)"
        (focus)="showDropdown = true"
        (blur)="onBlur()"
        [class.input-light]="variant === 'light'"
        [class.input-dark]="variant === 'dark'"
        [placeholder]="placeholder"
      />
      
      @if (showDropdown && (loading || filteredIngredients.length > 0)) {
        <div [class.dropdown-light]="variant === 'light'" [class.dropdown-dark]="variant === 'dark'">
          @if (loading) {
            <div class="dropdown-loading">Загрузка...</div>
          } @else if (filteredIngredients.length > 0) {
            @for (item of filteredIngredients; track item.id) {
              <button
                type="button"
                (click)="selectItem(item)"
                [class.dropdown-item-light]="variant === 'light'"
                [class.dropdown-item-dark]="variant === 'dark'"
              >
                {{ item.name }}
                @if (item.categoryName) {
                  <span class="ml-2 opacity-60">• {{ item.categoryName }}</span>
                }
              </button>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .input-light {
      width: 100%;
      border-radius: 0.75rem;
      border: 1px solid rgb(229, 231, 235);
      background-color: rgba(255, 255, 255, 0.8);
      padding: 0.5rem 0.75rem;
      color: rgb(55, 65, 81);
      transition: border-color 0.2s;
    }

    .input-light:focus {
      outline: none;
      border-color: rgb(59, 130, 246);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .input-light::placeholder {
      color: rgb(156, 163, 175);
    }

    .input-dark {
      width: 100%;
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.22);
      background: rgba(255, 255, 255, 0.1);
      padding: 0.625rem 0.75rem;
      color: #e2e8f0;
      transition: border-color 0.2s;
    }

    .input-dark:focus {
      outline: 2px solid rgba(125, 211, 252, 0.6);
      outline-offset: 1px;
    }

    .input-dark::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .dropdown-light {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 0.25rem;
      max-height: 16rem;
      overflow-y: auto;
      border-radius: 0.5rem;
      border: 1px solid rgb(229, 231, 235);
      background: white;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 50;
    }

    .dropdown-dark {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 0.25rem;
      max-height: 16rem;
      overflow-y: auto;
      border-radius: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
      z-index: 50;
    }

    .dropdown-loading {
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
      color: rgb(107, 114, 128);
    }

    .dropdown-item-light {
      width: 100%;
      text-align: left;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid rgb(243, 244, 246);
      background: none;
      border: none;
      font-size: 0.875rem;
      color: rgb(55, 65, 81);
      cursor: pointer;
      transition: background-color 0.15s;
    }

    .dropdown-item-light:hover {
      background-color: rgb(243, 244, 246);
    }

    .dropdown-item-light:active {
      background-color: rgb(229, 231, 235);
    }

    .dropdown-item-light:last-child {
      border-bottom: none;
    }

    .dropdown-item-dark {
      width: 100%;
      text-align: left;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: none;
      border: none;
      font-size: 0.875rem;
      color: rgba(226, 232, 240, 0.9);
      cursor: pointer;
      transition: background-color 0.15s;
    }

    .dropdown-item-dark:hover {
      background-color: rgba(125, 211, 252, 0.15);
    }

    .dropdown-item-dark:active {
      background-color: rgba(125, 211, 252, 0.25);
    }

    .dropdown-item-dark:last-child {
      border-bottom: none;
    }
  `]
})
export class IngredientAutocompleteComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Поиск ингредиентов...';
  @Input() variant: 'light' | 'dark' = 'light';
  @Output() selected = new EventEmitter<Ingredient>();

  private readonly ingredientService = inject(IngredientService);
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  searchText = '';
  showDropdown = false;
  loading = false;
  filteredIngredients: Ingredient[] = [];

  ngOnInit() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.performSearch(query);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(value: string) {
    this.searchSubject.next(value);
  }

  private performSearch(query: string) {
    if (!query.trim()) {
      this.filteredIngredients = [];
      return;
    }

    this.loading = true;
    this.ingredientService.list({ search: query, size: 50 }).subscribe({
      next: (res) => {
        this.filteredIngredients = res.content || [];
        this.loading = false;
      },
      error: () => {
        this.filteredIngredients = [];
        this.loading = false;
      }
    });
  }

  selectItem(item: Ingredient) {
    this.searchText = item.name;
    this.showDropdown = false;
    this.selected.emit(item);
  }

  onBlur() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 150);
  }
}
