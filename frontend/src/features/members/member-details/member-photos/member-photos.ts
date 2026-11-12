import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MemberService } from '../../../../core/services/member-service';
import { Photo } from '../../../../interfaces/photo';
import { PhotoUpload } from '../../../../shared/photo-upload/photo-upload';
import { AccountService } from '../../../../core/services/account-service';
import { StarButton } from '../../../../shared/star-button/star-button';
import { DeleteButton } from '../../../../shared/delete-button/delete-button';

@Component({
  imports: [PhotoUpload, StarButton, DeleteButton],
  selector: 'app-member-photos',
  styleUrl: './member-photos.css',
  templateUrl: './member-photos.html',
})
export class MemberPhotos {
  protected memberService = inject(MemberService);
  protected accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  protected photos = signal<Photo[]>([]);
  protected loading = signal(false);

  constructor() {}

  ngOnInit(): void {
    const memberId = this.route.parent?.snapshot.paramMap.get('id');
    if (memberId) {
      this.loading.set(true);
      this.memberService.getMemberPhotos(memberId).subscribe({
        next: (photos) => {
          this.photos.set(photos);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
  }

  onUploadImage(file: File) {
    this.loading.set(true);
    this.memberService.uploadPhoto(file).subscribe({
      next: (photo) => {
        this.memberService.editMode.set(false);
        this.loading.set(false);
        this.photos.update((photos) => [...photos, photo]);
        if(!this.memberService.member()?.imageUrl) {
          this.setMainLocalPhoto(photo);
        }
      },
      error: (error) => {
        console.error('Error uploading photo:', error);
        this.memberService.editMode.set(false);
        this.loading.set(false);
      }
    });
  }

  setMainPhoto(photo: Photo) {
    this.loading.set(true);
    this.memberService.setMainPhoto(photo).subscribe({
      next: () => {
        this.setMainLocalPhoto(photo);
        this.loading.set(false);
      }
    });
  }

  deletePhoto(photoId: number) {
    this.loading.set(true);
    this.memberService.deletePhoto(photoId).subscribe({
      next: () => {
        this.photos.update((photos) => photos.filter((p) => p.id !== photoId));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error deleting photo:', error);
        this.loading.set(false);
      }
    });
  }

  private setMainLocalPhoto(photo: Photo) {
    const currentUser = this.accountService.currentUser();
    if (currentUser) {
      this.accountService.setCurrentUser({ ...currentUser, imageUrl: photo.url });
    }
    this.memberService.member.update((member) =>
      member ? { ...member, imageUrl: photo.url } : member
    );
  }
}
