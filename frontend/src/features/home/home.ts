import { Component, inject, signal } from '@angular/core';
import { Register } from '../account/register/register';
import { AccountService } from '../../core/services/account-service';

@Component({
  imports: [Register],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private accService = inject(AccountService);
  protected currentUser = this.accService.currentUser;

  protected registerMode = signal(false);

  showRegister() {
    this.registerMode.set(true);
  }

  cancelRegister() {
    this.registerMode.set(false);
  }

}
