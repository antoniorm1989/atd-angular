import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dialog-warning-component',
  template: `
    <div class="dialog-wrapper">
      <img class="dialog-image" src="../../assets/images/warning-dialog.png" alt="Error Image" />
      <p>
        <span class="dialog-title" mat-dialog-title>{{ data.title }}</span>
        <div class="dialog-content" mat-dialog-content>{{ data.content }}</div>
        <button class="dialog-button dialog-cancel" (click)="onClose()" style="margin-right: 24px;">Regresar</button>
        <button class="dialog-button" (click)="onOk()" style="margin-left: 24px;">Aceptar</button>
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
      font-weight: 500;
      line-height: 28px;
      color: black;
    }
    .dialog-content {
      font-family: Roboto;
      font-size: 16px;
      font-weight: 400;
      line-height: 25px;
      text-align: center;
      color: #333333;
      margin: 30px 12px;
      height: 100px;
      overflow-y: auto;
    }
    .dialog-button {
      width: 300px;
      height: 48px;
      border-radius: 8px;
      border: 1px solid #BA9400;
      color: #FFFFFF;
      background-color: #BA9400;
      cursor: pointer;
      font-weight: 600;
      font-size: large;
      width: 200px;
    }
    .dialog-button.dialog-cancel {
      color: #BA9400;
      background-color: #FFFFFF;
    }
  `],
})

export class DialogWarningComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogWarningComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, content: string }
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }

  onOk(): void {
    this.dialogRef.close("ok");
  }
}