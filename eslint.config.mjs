import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import configPrettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import templateParser from '@angular-eslint/template-parser';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['dist/**', 'coverage/**', 'node_modules/**', '.history/**']
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tseslint.parser,
			ecmaVersion: 'latest',
			sourceType: 'module'
		},
		plugins: {
			'@angular-eslint': angular,
			prettier: prettierPlugin
		},
		rules: {
			...angular.configs.recommended.rules,
			...configPrettier.rules,
			'prettier/prettier': 'error',
			'arrow-body-style': 'off',
			'prefer-arrow-callback': 'off'
		}
	},
	{
		files: ['**/*.html'],
		languageOptions: {
			parser: templateParser
		},
		plugins: {
			'@angular-eslint/template': angularTemplate,
			prettier: prettierPlugin
		},
		rules: {
			...angularTemplate.configs.recommended.rules,
			...configPrettier.rules,
			'prettier/prettier': 'error',
			'@angular-eslint/template/prefer-control-flow': 'off'
		}
	}
);