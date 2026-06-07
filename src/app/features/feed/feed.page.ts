import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TuiButton, TuiError, TuiInput } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';
import { RecipeService } from '../../core/services/recipe.service';
import { RecipeCategoryService } from '../../core/services/recipe-category.service';
import { ErrorService } from '../../core/services/error.service';
import { Recipe } from '../../core/models/recipe.model';
import { Page } from '../../core/models/page.model';
import { Category } from '../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { FeedNavigationService } from '../../core/services/feed-navigation.service';
import { AuthenticatedImageDirective } from '../../shared/authenticated-image.directive';

@Component({
  selector: 'app-feed-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    TuiInput,
    TuiButton,
    TuiError,
    TuiCardLarge,
    AuthenticatedImageDirective,
  ],
  templateUrl: './feed.page.html',
  styleUrl: './feed.page.css',
})
export class FeedPage implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('loadMoreSentinel') loadMoreSentinel: ElementRef | null = null;

  private readonly recipesApi = inject(RecipeService);
  private readonly categoriesApi = inject(RecipeCategoryService);
  private readonly errorService = inject(ErrorService);
  private readonly feedNavigation = inject(FeedNavigationService);
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private observer: IntersectionObserver | null = null;

  protected recipes: Recipe[] = [];
  protected loading = false;
  protected loadingMore = false;
  protected error = '';
  protected query = '';
  protected categoryId: number | null = null;
  protected categories: Category[] = [];
  protected currentPage = 0;
  protected hasMore = true;

  ngOnInit() {
    this.load();
    this.loadCategories();

    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.recipes = [];
        this.currentPage = 0;
        this.hasMore = true;
        this.load();
      });

    this.feedNavigation.reset$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.resetFiltersAndLoad();
    });
  }

  ngAfterViewChecked() {
    if (this.loadMoreSentinel && !this.observer) {
      this.setupIntersectionObserver();
    }
    if (!this.loadMoreSentinel && this.observer) {
      this.destroyObserver();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
    this.destroyObserver();
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !this.loadingMore && !this.loading && this.hasMore) {
          this.loadMore();
        }
      },
      { threshold: 0.1 },
    );
    this.observer.observe(this.loadMoreSentinel!.nativeElement);
  }

  private destroyObserver() {
    this.observer?.disconnect();
    this.observer = null;
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  private applyCategoryFilter(items: Recipe[]): Recipe[] {
    if (this.categoryId === null) {
      return items;
    }

    return items.filter((recipe) => recipe.categoryId === this.categoryId);
  }

  private loadCategories() {
    this.categoriesApi.list().subscribe({
      next: (res) => (this.categories = res),
      error: () => {
        this.categories = [];
      },
    });
  }

  load(page = 0) {
    this.loading = page === 0;
    this.error = '';
    this.recipesApi
      .list({ page, search: this.query || undefined, categoryId: this.categoryId || undefined })
      .subscribe({
        next: (res) => {
          const filteredContent = this.applyCategoryFilter(res.content || []);

          if (page === 0) {
            this.recipes = filteredContent;
          } else {
            this.recipes.push(...filteredContent);
          }
          this.currentPage = page;
          this.hasMore =
            res.last === false ||
            (res.number !== undefined &&
              res.totalPages !== undefined &&
              res.number < res.totalPages - 1);
          this.loading = false;
          this.loadingMore = false;
        },
        error: (err) => {
          this.error = this.errorService.extractErrorMessage(err);
          this.loading = false;
          this.loadingMore = false;
        },
      });
  }

  private loadMore() {
    if (!this.hasMore || this.loadingMore) return;
    this.loadingMore = true;
    this.load(this.currentPage + 1);
  }

  setCategory(id: number | null) {
    this.categoryId = id;
    this.recipes = [];
    this.currentPage = 0;
    this.hasMore = true;
    this.destroyObserver();
    this.load();
  }

  private resetFiltersAndLoad() {
    this.query = '';
    this.categoryId = null;
    this.recipes = [];
    this.currentPage = 0;
    this.hasMore = true;
    this.destroyObserver();
    this.load();
  }
}
