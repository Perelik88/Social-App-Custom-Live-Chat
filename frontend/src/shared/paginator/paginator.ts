import { Component, computed, input, model, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-paginator',
  styleUrl: './paginator.css',
  templateUrl: './paginator.html',
})
export class Paginator {
  pageNumber = model(1);
  pageSize = model(10);
  totalItems = input(0);
  pageSizeOptions = input([10, 20, 50]);

  pageChange = output<{ pageNumber: number, pageSize: number }>();

  lastItemIndex = computed(() => Math.min(this.pageNumber() * this.pageSize(), this.totalItems()));

  onPageChange(newPage?: number, newPageSize?: EventTarget) {
    if (newPage) this.pageNumber.set(newPage);
    if (newPageSize) {
      const size = Number((newPageSize as HTMLSelectElement).value)
      this.pageSize.set(size);
    }

    this.pageChange.emit({ pageNumber: this.pageNumber(), pageSize: this.pageSize() });
  }
}
