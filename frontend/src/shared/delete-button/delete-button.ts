import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-delete-button',
  styleUrl: './delete-button.css',
  templateUrl: './delete-button.html',
})
export class DeleteButton {
  disabled = input<boolean>();
  clickEvent = output<Event>();

  onClick(event: Event) {
    this.clickEvent.emit(event);
  }
}
