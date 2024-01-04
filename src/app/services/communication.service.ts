// communication.service.ts

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  private methodSubject = new Subject<void>();

  // Observable to subscribe to changes
  methodCalled$ = this.methodSubject.asObservable();

  // Method to trigger the event
  callMethod() {
    this.methodSubject.next();
  }
}
