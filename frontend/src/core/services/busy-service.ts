import { Service, signal } from '@angular/core';

@Service()
export class BusyService {
  busyCounter = signal(0);

  busy(){
    this.busyCounter.update(n => n + 1);
  }
  idle(){
    this.busyCounter.update(n => Math.max(0, n - 1));
  }
}
