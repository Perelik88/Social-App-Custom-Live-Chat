import { Component, inject, signal, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { ToastService } from '../../../../core/services/toast-service';
import { FormsModule, NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../../core/pipes/time-ago-pipe';
import { Member, MemberEdit } from '../../../../interfaces/member';
import { MemberService } from '../../../../core/services/member-service';
import { AccountService } from '../../../../core/services/account-service';

@Component({
  imports: [DatePipe, FormsModule, TimeAgoPipe],
  selector: 'app-member-profile',
  styleUrl: './member-profile.css',
  templateUrl: './member-profile.html',
})
export class MemberProfile implements OnInit, OnDestroy {
  @ViewChild('editForm') editForm?: NgForm;
  @HostListener('window:beforeunload', ['$event']) notify($event: BeforeUnloadEvent) {
    if (this.editForm?.dirty) {
      $event.preventDefault();
    }
  }
  private toastService = inject(ToastService);
  private accountService = inject(AccountService);
  protected memberService = inject(MemberService);
  protected member = this.memberService.member;
  protected memberEdit?: MemberEdit;

  ngOnInit(): void {
    this.memberEdit = {
      displayName: this.member()?.displayName || '',
      bio: this.member()?.bio || '',
      city: this.member()?.city || '',
      country: this.member()?.country || '',
    };
  }

  editProfile() {
    const member = this.member();
    const memberEdit = this.memberEdit;
    if (!member || !memberEdit) {
      return;
    }
    const updatedMember: Member = { ...member, ...memberEdit };
    this.memberService.updateMember(memberEdit).subscribe({
      next: () => {
        const currentUser = this.accountService.currentUser();
        if (currentUser && currentUser.displayName !== updatedMember.displayName) {
          this.accountService.setCurrentUser({ ...currentUser, displayName: updatedMember.displayName });
        }
        this.member.set(updatedMember as Member);
        this.toastService.success('Profile updated successfully');
        this.memberService.editMode.set(false);
        this.editForm?.resetForm(updatedMember);
      },
      error: (err) => {
        this.toastService.error('Failed to update profile');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.memberService.editMode()) {
      this.memberService.editMode.set(false);
    }
  }
}
