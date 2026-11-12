import { Service, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LikesService } from './likes-service';
import { User } from '../../interfaces/user';
import { LoginCreds, RegisterCreds } from '../../interfaces/user';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Service()
export class AccountService {
  private http = inject(HttpClient);
  private likesService = inject(LikesService);
  currentUser = signal<User | null>(null);

  private baseUrl = environment.apiUrl;

  login(creds: LoginCreds) {
    return this.http.post<User>(`${this.baseUrl}/account/login`, creds).pipe(
      tap(user => {
        if (user) {
          this.setCurrentUser(user);
        }
      }),
    );
  }

  register(creds: RegisterCreds) {
    return this.http.post<User>(`${this.baseUrl}/account/register`, creds).pipe(
      tap(user => {
        if (user) {
          this.setCurrentUser(user);
        }
      }),
    );
  }

  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.likesService.getLikesIds();
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('filters');
    this.likesService.clearLikesIds();
    this.currentUser.set(null);
  }
}
