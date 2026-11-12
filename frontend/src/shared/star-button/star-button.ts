import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-star-button',
  styleUrl: './star-button.css',
  templateUrl: './star-button.html',
})
export class StarButton {
  disabled = input<boolean>();
  selected = input<boolean>();
  clickEvent = output<Event>();

  onClick(event: Event) {
    this.clickEvent.emit(event);
  }
}
