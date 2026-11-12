import { Component, inject, signal } from '@angular/core';
import type { ApiError } from '../../types/error';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-server-error',
  styleUrl: './server-error.css',
  templateUrl: './server-error.html',
})
export class ServerError {
  protected error = signal<ApiError | null>(null);
  protected router = inject(Router);
  protected showDetails: boolean = false;

  constructor() {
    const navigation = this.router.currentNavigation();
    if (navigation?.extras?.state?.['error']) {
      this.error.set(navigation.extras.state['error']);
    }
  };

  protected goBack() {
    this.router.navigate(['../']);
  }

  protected toggleDetails() {
    this.showDetails = !this.showDetails;
  }
}
