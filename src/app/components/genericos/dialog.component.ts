import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dialog-component',
  template: `
          <div class="dialog-wrapper">
              <h1 mat-dialog-title>{{ data.title }}</h1>
              <div class="dialog-content" mat-dialog-content>{{ data.content }}</div>
          </div>
          `,
          styles: [`
              .dialog-wrapper {
                padding: 20px;
              }
              .dialog-content{
                color: var(--mdc-dialog-supporting-text-color, rgba(0, 0, 0, 0.6));
              }
        `],
})

export class DialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, content: string }
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }
}
