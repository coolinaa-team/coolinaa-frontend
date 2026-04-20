import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiCardLarge } from '@taiga-ui/layout';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, TuiCardLarge],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent {}
