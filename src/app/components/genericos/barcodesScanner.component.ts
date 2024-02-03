import { Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { BrowserMultiFormatReader } from '@zxing/library';

@Component({
  selector: 'app-barcode-scanner',
  template: `
    <video #videoElement></video>
  `,
  styles: [`
    video {
      width: -webkit-fill-available;
    }
  `],
  standalone: true,
})
export class BarcodeScannerComponent implements OnDestroy{
  @ViewChild('videoElement') videoElement!: ElementRef;
  @Output() scannedValue = new EventEmitter<string>();

  private codeReader!: BrowserMultiFormatReader;

  ngOnDestroy() {
    this.stop();
  }

  start(){
    this.codeReader = new BrowserMultiFormatReader();

    // Access the device camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        // Assign the camera stream to the video element
        this.videoElement.nativeElement.srcObject = stream;
        this.codeReader.decodeFromVideoDevice(null, this.videoElement.nativeElement, (result, error) => {
          if (result) {
            const scannedText = result.getText();
            this.scannedValue.emit(scannedText); 
          }
          if (error) {
          }
        });
      })
      .catch(err => console.error('Error accessing camera:', err));
  }

  stop(){
    this.codeReader.reset();
  }
}
