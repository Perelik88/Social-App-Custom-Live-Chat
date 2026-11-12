import { Component, inject, signal, OnInit } from '@angular/core';
import { LikesService } from '../../core/services/likes-service';
import { Member } from '../../interfaces/member';
import { PaginatedResult } from '../../interfaces/pagination';
import { MemberCard } from '../members/member-card/member-card';
import { Paginator } from '../../shared/paginator/paginator';

@Component({
  imports: [MemberCard, Paginator],
  selector: 'app-lists',
  styleUrl: './lists.css',
  templateUrl: './lists.html',
})
export class Lists implements OnInit {
  private likesService = inject(LikesService);
  protected paginatedResults = signal<PaginatedResult<Member> | null>(null);
  protected predicate = signal<string>('liked');
  protected pageNumber = 1;
  protected pageSize = 10;

  tabs = [
    {label: 'Liked', value: 'liked'},
    {label: 'Liked By', value: 'likedBy'},
    {label: 'Mutual', value: 'mutual'}
  ]

  ngOnInit(): void {
    this.getLikes();
  }

  setPredicate(value: string) {
    if (this.predicate() !== value) {
      this.predicate.set(value);
      this.pageNumber = 1;
      this.getLikes();
    }
  }

  removeUnlikedMember(memberId: string) {
    if (this.predicate() !== 'likedBy') {
      this.paginatedResults.update(paginated => {
        if (!paginated) return paginated;
        return {
          ...paginated,
          items: paginated.items
          .filter(member => member.id !== memberId)
        };
      });
    }
  }

  getLikes() {
    this.likesService.getLikes(this.predicate(), this.pageNumber.toString(), this.pageSize.toString()).subscribe({
      next: (members) => {
        this.paginatedResults.set(members);
      },
      error: (err) => console.error('Failed to load liked members:', err)
    });
  }

  onPageChange(event: {pageNumber: number, pageSize: number}) {
    this.pageNumber = event.pageNumber;
    this.pageSize = event.pageSize;
    this.getLikes();
  }
}
