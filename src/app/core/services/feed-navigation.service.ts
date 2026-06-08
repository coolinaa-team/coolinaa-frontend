import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FeedNavigationService {
  private readonly resetSubject = new Subject<void>();

  readonly reset$ = this.resetSubject.asObservable();

  resetFeed(): void {
    this.resetSubject.next();
  }
}
