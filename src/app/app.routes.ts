import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { MainLayoutComponent } from './layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout.component';

export const routes: Routes = [
	{
		path: '',
		component: MainLayoutComponent,
		canActivate: [authGuard],
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'feed' },
			{
				path: 'feed',
				loadComponent: () => import('./features/feed/feed.page').then((m) => m.FeedPage)
			},
			{
				path: 'match',
				loadComponent: () => import('./features/match/match.page').then((m) => m.MatchPage)
			},
			{
				path: 'admin',
				canActivate: [adminGuard],
				loadComponent: () => import('./features/admin/admin.page').then((m) => m.AdminPage)
			},
			{
				path: 'fridge',
				loadComponent: () => import('./features/fridge/fridge.page').then((m) => m.FridgePage)
			},
			{
				path: 'recipes/create',
				loadComponent: () => import('./features/recipes/recipe-create.page').then((m) => m.RecipeCreatePage)
			},
			{
				path: 'recipes/:id',
				loadComponent: () => import('./features/recipes/recipe-detail.page').then((m) => m.RecipeDetailPage)
			},
			{
				path: 'recipes',
				redirectTo: 'feed',
				pathMatch: 'full'
			},
			{
				path: 'profile',
				loadComponent: () => import('./features/profile/profile.page').then((m) => m.ProfilePage)
			},
			{
				path: 'profile/my-recipes',
				loadComponent: () => import('./features/profile/my-recipes.page').then((m) => m.MyRecipesPage)
			}
		]
	},
	{
		path: 'auth',
		component: AuthLayoutComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'login' },
			{
				path: 'login',
				loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent)
			},
			{
				path: 'register',
				loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent)
			}
		]
	},
	{ path: '**', redirectTo: '' }
];
