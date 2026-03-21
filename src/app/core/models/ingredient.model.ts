export interface Ingredient {
  id: number;
  name: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  isActive?: boolean;
}

export interface UserIngredient {
  id: number;
  ingredientId: number;
  ingredientName?: string;
  quantity?: number;
  unitId?: number;
  unitName?: string;
  expiresAt?: string;
  isExpired?: boolean;
}

export interface UserIngredientRequest {
  ingredientId: number;
  quantity: number;
  unitId?: number;
  expiresAt?: string;
}
