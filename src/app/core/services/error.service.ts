import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly errorTranslations: Record<string, string> = {
    // Validation errors
    'email or username required': 'Укажите почту или имя пользователя',
    'password must be not empty': 'Пароль не может быть пустым',
    'title must be not empty': 'Название не может быть пустым',
    'title must not exceed 200 characters': 'Название не должно превышать 200 символов',
    'preparation time must me positive number': 'Время подготовки должно быть положительным числом',
    'cooking time must be positive': 'Время готовки должно быть положительным числом',
    'cooking time must be positive number': 'Время готовки должно быть положительным числом',
    'difficulty level must be from 1': 'Уровень сложности должен быть от 1',
    'difficulty level must be max 5': 'Уровень сложности не должен превышать 5',
    'instructions must be not empty': 'Инструкция не может быть пустой',
    'servings must be positive number': 'Количество порций должно быть положительным числом',
    'quantity must be positive': 'Количество должно быть положительным числом',
    'quantity is required': 'Укажите количество',
    'ingredients must be not empty': 'Должен быть хотя бы один ингредиент',

    // Auth errors
    'email already exists': 'Почта уже зарегистрирована',
    'username already exists': 'Имя пользователя уже занято',
    'invalid credentials': 'Неверная почта/имя пользователя или пароль',
    'bad credentials': 'Неверная почта/имя пользователя или пароль',
    'user account is locked': 'Аккаунт заблокирован',
    'user account is disabled': 'Аккаунт отключен',
    'user not found': 'Пользователь не найден',
    'code must be not empty': 'Введите код подтверждения',
    'code must be exactly 8 digits long': 'Код должен состоять из 8 цифр',
    'password must be min 8 characters': 'Пароль должен содержать минимум 8 символов',
    'invalid confirmation code': 'Неверный код подтверждения',
    'код уже был использован': 'Код уже был использован',
    'срок действия кода истек': 'Срок действия кода истек',

    // JWT errors
    'invalid jwt token': 'Сессия истекла, пожалуйста перезагрузитесь',
    'expired jwt token': 'Сессия истекла, пожалуйста перезагрузитесь',
    'unsupported jwt token': 'Ошибка авторизации, пожалуйста перезагрузитесь',
    'jwt claims r empty': 'Ошибка авторизации, пожалуйста перезагрузитесь',

    // Auth required
    'auth is required': 'Необходимо авторизоваться',
    'full authentication is required to access this resource': 'Необходимо авторизоваться',
    unauthorized: 'Необходимо авторизоваться',

    // Access denied
    'access denied': 'У вас нет доступа к этому ресурсу',

    // Recipe errors
    'recipe not found': 'Рецепт не найден',
    'ingredient not found': 'Ингредиент не найден',
    'unit not found': 'Единица измерения не найдена',
    'category not found': 'Категория не найдена',

    // Review errors
    'review already exists for user': 'Вы уже оставили отзыв на этот рецепт',
    'review not found': 'Отзыв не найден',

    // Ingredient errors
    'ingredient already exists': 'Такой ингредиент уже существует',

    // Generic error messages
    'internal server error': 'Внутренняя ошибка сервера. Попробуйте позже',
    'bad request': 'Некорректные данные. Пожалуйста проверьте форму',
    'not found': 'Ресурс не найден',
    conflict: 'Конфликт данных. Попробуйте ещё раз',
  };

  extractErrorMessage(error: any): string {
    // If it's an HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      const errorBody = error.error as ApiErrorResponse | string;

      // Extract message from backend response (structured JSON)
      if (typeof errorBody === 'object' && errorBody?.message) {
        return this.translateMessage(errorBody.message);
      }

      // If error.error is a string (some backends return plain text)
      if (typeof errorBody === 'string' && errorBody) {
        return this.translateMessage(errorBody);
      }

      // Handle status-based errors
      switch (error.status) {
        case 0:
          return 'Ошибка подключения. Проверьте интернет соединение';
        case 400:
          return this.translateMessage('bad request');
        case 401:
          return this.translateMessage('auth is required');
        case 403:
          return this.translateMessage('access denied');
        case 404:
          return this.translateMessage('not found');
        case 409:
          return this.translateMessage('conflict');
        case 500:
          return this.translateMessage('internal server error');
        default:
          return 'Произошла ошибка. Попробуйте позже';
      }
    }

    // If it's already a string
    if (typeof error === 'string') {
      return this.translateMessage(error);
    }

    // If it has an error message property
    if (error?.error?.message) {
      return this.translateMessage(error.error.message);
    }

    // If it has a message property
    if (error?.message) {
      return this.translateMessage(error.message);
    }

    return 'Произошла неожиданная ошибка. Попробуйте позже';
  }

  private translateMessage(message: string): string {
    if (!message) {
      return 'Произошла ошибка. Попробуйте позже';
    }

    const lowerMessage = message.toLowerCase().trim();
    const directTranslation = this.errorTranslations[lowerMessage];

    if (directTranslation) {
      return directTranslation;
    }

    const messageWithoutField = lowerMessage.includes(':')
      ? lowerMessage.split(':').pop()?.trim()
      : lowerMessage;

    if (messageWithoutField && this.errorTranslations[messageWithoutField]) {
      return this.errorTranslations[messageWithoutField];
    }

    const matchedKey = Object.keys(this.errorTranslations).find((key) =>
      lowerMessage.includes(key),
    );

    return matchedKey ? this.errorTranslations[matchedKey] : message;
  }
}
