import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-message',
  template: `
              <div [innerHTML]="data.html"></div>
              <button mat-icon-button class="close-button" (click)="closeSnackbar()">
                  <mat-icon>close</mat-icon>
              </button>
          `,
  styles: [`
      :host {
        position: relative;
      }

      .close-button {
        position: absolute;
        top: -10px;
        right: 0px;
      }
`],
})

export class MessageComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any, private snackBarRef: MatSnackBarRef<MessageComponent>) { }

  closeSnackbar() {
    this.snackBarRef.dismiss();
  }
}
