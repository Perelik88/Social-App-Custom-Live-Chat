import { ChangeDetectorRef, Component, ViewChild, ElementRef, inject, output } from '@angular/core';
import { MemberParams } from '../../../interfaces/member';

@Component({
  imports: [],
  selector: 'app-filter-modal',
  styleUrl: './filter-modal.css',
  templateUrl: './filter-modal.html',
})
export class FilterModal {
  @ViewChild('filterModal') modalRef!: ElementRef<HTMLDialogElement>;
  private changeDetectorRef = inject(ChangeDetectorRef);
  closeModal = output();
  filterChange = output<MemberParams>();
  memberParams = new MemberParams();
  protected readonly minimumAge = 18;
  protected readonly maximumAge = 99;

  open(data: MemberParams) {
    this.memberParams = { ...data };
    this.changeDetectorRef.detectChanges();
    this.modalRef.nativeElement.showModal();
  }

  close() {
    this.modalRef.nativeElement.close();
    this.closeModal.emit();
  }

  setMinAge(event: Event) {
    const input = event.target as HTMLInputElement;
    const age = Number(input.value);
    this.memberParams.minAge = Math.min(
      Math.max(age, this.minimumAge),
      this.memberParams.maxAge
    );
    input.value = String(this.memberParams.minAge);
  }

  setMaxAge(event: Event) {
    const input = event.target as HTMLInputElement;
    const age = Number(input.value);
    this.memberParams.maxAge = Math.max(
      Math.min(age, this.maximumAge),
      this.memberParams.minAge
    );
    input.value = String(this.memberParams.maxAge);
  }

  setGender(event: Event) {
    const gender = (event.target as HTMLSelectElement).value;
    this.memberParams.gender = gender || undefined;
    this.applyFilters();
  }

  setOrderBy(event: Event) {
    const orderBy = (event.target as HTMLSelectElement).value;
    this.memberParams.orderBy = orderBy;
    this.applyFilters();
  }

  applyFilters() {
    this.filterChange.emit({ ...this.memberParams });
  }

  agePosition(age: number) {
    return ((age - this.minimumAge) / (this.maximumAge - this.minimumAge)) * 100;
  }
}
