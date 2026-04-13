import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { IngredientService } from '../../core/services/ingredient.service';
import { Ingredient } from '../../core/models/ingredient.model';

@Component({
  selector: 'app-ingredient-autocomplete',
  imports: [CommonModule, FormsModule],
  templateUrl: './ingredient-autocomplete.component.html',
  styleUrl: './ingredient-autocomplete.component.css',
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
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
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
      },
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
