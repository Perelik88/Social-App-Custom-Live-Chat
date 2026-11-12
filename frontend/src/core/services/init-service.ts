import { Service, inject } from '@angular/core';
import { AccountService } from './account-service';
import { LikesService } from './likes-service';
import { of } from 'rxjs';

@Service()
export class InitService {
  private accountService = inject(AccountService);
  private likesService = inject(LikesService);

  public init() {
    const userString = localStorage.getItem('user');
    if (!userString) {
      this.accountService.currentUser.set(null);
      return;
    }
    const user = JSON.parse(userString);
    this.accountService.currentUser.set(user);
    this.likesService.getLikesIds();
    return of(null)
  }
}
