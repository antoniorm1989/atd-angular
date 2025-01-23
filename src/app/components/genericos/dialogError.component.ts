import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dialog-error-component',
  template: `
    <div class="dialog-wrapper">
      <img class="dialog-image" src="../../assets/images/error-svgrepo-com.svg" alt="Error Image" />
      <p>
        <span class="dialog-title" mat-dialog-title>{{ data.title }}</span>
        <div class="dialog-content" mat-dialog-content>{{ data.content }}</div>
        <button class="dialog-button" (click)="onClose()">Cerrar</button>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      padding: 20px;
      height: 400px;
      text-align: center;
    }
    .dialog-image {
      width: 100px;
      height: 100px;
      margin: 20px auto;
    }
    .dialog-title {
      font-family: Roboto;
      font-size: 24px;
      font-weight: 700;
      line-height: 28px;
      color: #D32F2F; /* Rojo para indicar error */
    }
    .dialog-content {
      font-family: Roboto;
      font-size: 16px;
      font-weight: 400;
      line-height: 25px;
      text-align: center;
      color: #333333;
      margin-top: 20px;
    }
    .dialog-button {
      width: 300px;
      height: 48px;
      border-radius: 8px;
      border: 1px solid #D32F2F;
      color: #FFFFFF;
      background-color: #D32F2F;
      margin-top: 30px;
      cursor: pointer;
    }
    .dialog-button:hover {
      background-color: #B71C1C;
    }
  `],
})

export class DialogErrorComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogErrorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, content: string }
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }
}