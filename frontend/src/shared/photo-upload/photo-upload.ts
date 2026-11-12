import { Component, inject, input, output, signal } from '@angular/core';
import { MemberService } from '../../core/services/member-service';
import { ToastService } from '../../core/services/toast-service';
import { Photo } from '../../interfaces/photo';

@Component({
  selector: 'app-photo-upload',
  styleUrl: './photo-upload.css',
  templateUrl: './photo-upload.html',
})
export class PhotoUpload {
  private memberService = inject(MemberService);
  private toastService = inject(ToastService);
  protected uploading = signal(false);
  protected imgSrc = signal<string | ArrayBuffer | null>(null);
  protected isDraged = signal(false);
  private fileToUpload?: File | null = null;
  uploadFile = output<File>();
  loading = input<boolean>(false);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraged.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraged.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraged.set(false);

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastService.error('Please select an image file.');
      return;
    }

    this.fileToUpload = file;
    this.previewImage(file);
  }

  onCancel() {
    this.fileToUpload = null;
    this.imgSrc.set(null);
  }

  onUpload() {
    if (this.fileToUpload) {
       this.uploadFile.emit(this.fileToUpload);
    }
  }

  previewImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imgSrc.set(reader.result);
    };
    reader.readAsDataURL(file);
  }
}
