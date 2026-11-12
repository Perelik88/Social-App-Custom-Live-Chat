import { Component, input, inject, computed, output } from '@angular/core';
import { LikesService } from '../../../core/services/likes-service';
import { Member } from '../../../interfaces/member';
import { RouterLink } from '@angular/router';
import { AgePipe } from '../../../core/pipes/age-pipe';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';

@Component({
  imports: [RouterLink, AgePipe, TimeAgoPipe],
  selector: 'app-member-card',
  styleUrl: './member-card.css',
  templateUrl: './member-card.html',
})
export class MemberCard {
  private likesService = inject(LikesService);
  member = input.required<Member>();
  unliked = output<string>();
  protected hasLiked = computed(() => this.likesService.likeIds().includes(this.member().id));

  toggleLike() {
    this.likesService.toggleLike(this.member().id).subscribe({
      next: () => {
        if (this.hasLiked()) {
          this.likesService.likeIds.update(ids => ids.filter(id => id !== this.member().id));
          this.unliked.emit(this.member().id);
        } else {
          this.likesService.likeIds.update(ids => [...ids, this.member().id]);
        }
      },
      error: (err) => {
        console.error('Failed to toggle like:', err);
      },
    });
  }
}
