import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dialog-success-component',
  template: `
          <div class="dialog-wrapper">
              <img class="dialog-image" src="../../assets/images/img-success.svg" alt="Image"/>
              <p>
              <span class="dialog-title" mat-dialog-title>{{ data.title }}</span>
              <div class="dialog-content" mat-dialog-content>{{ data.content }}</div>
              <button class="dialog-button" (click)="onClose()">Aceptar</button>
          </div>
          `,
          styles: [`
              .dialog-wrapper {
                padding: 20px;
                height: 400px;
                text-align: center;
              }
              .dialog-image{
                font-family: Roboto;
                font-size: 24px;
                font-weight: 500;
                line-height: 28.13px;
              }
              .dialog-title{
                font-family: Roboto;
                font-size: 24px;
                font-weight: 500;
                line-height: 28.13px;
              }
              .dialog-content{
                font-family: Roboto;
                font-size: 16px;
                font-weight: 400;
                line-height: 25px;
                text-align: center;
                color: #333333;
                margin-top: 40px
              }
              .dialog-button{
                width: 300px;
                height: 48.75px;
                gap: 0px;
                border-radius: 8px 8px 8px 8px;
                opacity: 0px;
                border: 1px solid #BA9400;
                color: #BA9400;
                margin-top: 40px;
                background-color: #FFFFFF;
                outline: #BA9400 !important;
              }
        `],
})

export class DialogSuccessComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogSuccessComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, content: string }
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }
}
