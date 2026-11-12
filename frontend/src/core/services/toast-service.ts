import { Service } from '@angular/core';

@Service()
export class ToastService {
  constructor() {
    this.createToastContainer();
  }

  private createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast toast-bottom toast-end';
      document.body.appendChild(container);
    }
    return container;
  }

  private createToastElement(message: string, alertClass: string, duration: number = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      return;
    }
    const toast = document.createElement('div');
    toast.innerHTML = `
    <span>${message}</span>
    <button class="ml-4 btn btn-sm btn-ghost">×</button>
    `;
    toast.classList.add('alert', alertClass, 'shadow-lg');
    toast.querySelector('button')?.addEventListener('click', () => {
      toastContainer.removeChild(toast);
    });
    toastContainer.append(toast);
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, duration);
  }

  public success(message: string, duration?: number) {
    this.createToastElement(message, 'alert-success', duration);
  }

  public error(message: string, duration?: number) {
    this.createToastElement(message, 'alert-error', duration);
  }

  public info(message: string, duration?: number) {
    this.createToastElement(message, 'alert-info', duration);
  }

  public warning(message: string, duration?: number) {
    this.createToastElement(message, 'alert-warning', duration);
  }
}
