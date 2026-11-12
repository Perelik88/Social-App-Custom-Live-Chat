import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  imports: [],
  selector: 'app-not-found',
  styleUrl: './not-found.css',
  templateUrl: './not-found.html',
})
export class NotFound {
  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
