import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  imports: [],
  selector: 'app-test-errors',
  styleUrl: './test-errors.css',
  templateUrl: './test-errors.html',
})
export class TestErrors {
  private http = inject(HttpClient);
  baseUrl = 'https://localhost:5001/api';
  validationErrors = signal<string[]>([]);

  get400Error() {
    return this.http.get(`${this.baseUrl}/error/bad-request`)
    .subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error)
    });
  }

  get401Error() {
    return this.http.get(`${this.baseUrl}/error/auth`)
    .subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error)
    });
  }

  get404Error() {
    return this.http.get(`${this.baseUrl}/error/not-found`)
    .subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error)
    });
  }

  get500Error() {
    return this.http.get(`${this.baseUrl}/error/server-error`)
    .subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error)
    });
  }

  get400ValidationError() {
    return this.http.post(`${this.baseUrl}/account/register`, {})
    .subscribe({
      next: (response) => console.log(response),
      error: (error) => {
        console.error(error);
        this.validationErrors.set(error)
      }
    });
  }

}
