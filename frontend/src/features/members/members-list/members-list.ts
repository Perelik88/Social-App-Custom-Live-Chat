import { Member } from './../../../interfaces/member';
import { MemberService } from './../../../core/services/member-service';
import { MemberParams } from '../../../interfaces/member';
import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { MemberCard } from '../member-card/member-card';
import { PaginatedResult } from '../../../interfaces/pagination';
import { Paginator } from '../../../shared/paginator/paginator';
import { FilterModal } from '../filter-modal/filter-modal';

@Component({
  imports: [MemberCard, Paginator, FilterModal],
  selector: 'app-members-list',
  styleUrl: './members-list.css',
  templateUrl: './members-list.html',
})
export class MembersList implements OnInit {
  @ViewChild('filterModal') modal!: FilterModal;
  private memberService = inject(MemberService);
  protected members = signal<PaginatedResult<Member> | null>(null);
  protected memberParams = new MemberParams();

  constructor() {
    const filters = localStorage.getItem('filters');
    if (filters) {
      this.memberParams = JSON.parse(filters);
    }
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService
      .getMembers(this.memberParams)
      .subscribe({
        next: (result) => this.members.set(result),
        error: (err) => console.error(err)
      });
  }

  onPageChange(event: { pageNumber: number; pageSize: number }) {
    this.memberParams.pageNumber = event.pageNumber;
    this.memberParams.pageSize = event.pageSize;
    this.loadMembers();
  }

  openFilterModal() {
    this.modal.open(this.memberParams);
  }

  onFilterModalClose() {
    console.log('Filter modal closed');
  }

  resetFilters() {
    this.memberParams = new MemberParams();
    this.loadMembers();
  }

  onFilterChange(data: MemberParams) {
    this.memberParams = { ...data, pageNumber: 1 };
    this.loadMembers();
  }

  get displayMessage(): string {
    const defaultParams = new MemberParams();
    const filters: string[] = [];
    if (this.memberParams.gender && this.memberParams.gender !== defaultParams.gender) {
      filters.push(`Gender: ${this.memberParams.gender}`);
    }
    if (this.memberParams.minAge !== defaultParams.minAge || this.memberParams.maxAge !== defaultParams.maxAge) {
      filters.push(`Age: ${this.memberParams.minAge} - ${this.memberParams.maxAge}`);
    }
    if (this.memberParams.orderBy !== defaultParams.orderBy) {
      filters.push(`Order by: ${this.memberParams.orderBy}`);
    }
    return filters.length > 0 ? `Displaying members filtered by ${filters.join(' | ')}` : 'Displaying all members';
  }
}
