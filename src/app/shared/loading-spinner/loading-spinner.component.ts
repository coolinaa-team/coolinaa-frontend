import { Component } from '@angular/core';
import { TuiLoader } from '@taiga-ui/core';

@Component({
  selector: 'app-loading-spinner',
  imports: [TuiLoader],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css'],
})
export class LoadingSpinnerComponent {}
