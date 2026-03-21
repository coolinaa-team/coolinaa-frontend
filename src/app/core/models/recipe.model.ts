import { User } from './user.model';

export interface RecipeIngredientDto {
  ingredientId: number;
  ingredientName?: string;
  quantity?: number;
  unitId?: number;
  unitName?: string;
  notes?: string;
  orderIndex?: number;
}

export interface Recipe {
  id: number;
  title: string;
  description?: string;
  instructions: string;
  preparationTime?: number;
  cookingTime?: number;
  difficultyLevel?: number;
  servings?: number;
  imageUrl?: string;
  isPublic?: boolean;
  status?: string;
  categoryId?: number;
  categoryName?: string;
  author?: User;
  ingredients?: RecipeIngredientDto[];
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeMatch {
  recipeId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  categoryId?: number;
  categoryName?: string;
  matchPercentage?: number;
  matchedIngredients?: number;
  totalIngredients?: number;
  missingIngredients?: {
    ingredientId: number;
    ingredientName: string;
    quantity?: number;
    unitName?: string;
  }[];
  cookingTime?: number;
  difficultyLevel?: number;
  averageRating?: number;
}

export interface RecipeCreateRequest {
  title: string;
  description?: string;
  instructions: string;
  preparationTime?: number;
  cookingTime?: number;
  difficultyLevel?: number;
  servings?: number;
  imageUrl?: string;
  categoryId?: number;
  ingredients: RecipeIngredientCreate[];
  isPublic?: boolean;
}

export interface RecipeIngredientCreate {
  ingredientId: number;
  quantity: number;
  unitId?: number;
  notes?: string;
  orderIndex?: number;
}

export interface RecipeSummary {
  id: number;
  title: string;
  description?: string;
  categoryName?: string;
  cookingTime?: number;
  averageRating?: number;
}

export interface RecipeSummary {
  id: number;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  minutes: number;
}
