import { Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';

@Component({
  selector: 'app-barcode-scanner',
  template: `
    <select id="sourceSelect" class="material-select">
    </select>
    <div style="height: 24px;"></div>
    <video #videoElement></video>
  `,
  styles: [`
    video{
      width: -webkit-fill-available;
    }
    .material-select {
      display: block;
      width: 100%;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: #fff;
      appearance: none; /* Eliminar el estilo predeterminado del navegador */
    }

    .material-select:focus {
      outline: none; /* Eliminar el contorno de enfoque */
      border-color: #2196F3; /* Cambiar el color del borde al enfocar */
    }

  `],
  imports: [
    MatFormFieldModule,
    MatSelectModule
  ],
  standalone: true
})
export class BarcodeScannerComponent implements OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('select') select!: MatSelect;
  @Output() scannedValue = new EventEmitter<string>();

  private codeReader!: BrowserMultiFormatReader;
  private lastStream!: MediaStream;

  ngOnDestroy() {
    this.stop();
  }

  start() {
    this.codeReader = new BrowserMultiFormatReader();

    this.codeReader.listVideoInputDevices().then((videoInputDevices) => {
      if (videoInputDevices.length > 0) {
        this.onDeviceSelected(videoInputDevices[0].deviceId);
        const sourceSelect = document.getElementById('sourceSelect') as HTMLSelectElement;
        if (sourceSelect) {
          videoInputDevices.forEach((element) => {
            const sourceOption = document.createElement('option');
            sourceOption.text = element.label;
            sourceOption.value = element.deviceId;
            sourceOption.selected = videoInputDevices[0].deviceId == element.deviceId;
            sourceSelect.appendChild(sourceOption);
          });
          sourceSelect.disabled = videoInputDevices.length === 1;
          sourceSelect.onchange = () => {
            this.onDeviceSelected(sourceSelect.value)
          };
        }
      }
    });

  }

  onDeviceSelected(deviceId: string) {
    this.stop();
    this.openCameraScanner(deviceId);
  }

  openCameraScanner(deviceId: string) {
    if(this.lastStream) {
      this.lastStream.getTracks().forEach(track => track.stop()) 
    }
    navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } })
      .then(stream => {
        this.lastStream = stream;
        this.videoElement.nativeElement.srcObject = this.lastStream;

        this.codeReader.decodeFromVideoDevice(deviceId, this.videoElement.nativeElement, (result, error) => {
          if (result) {
            const scannedText = result.getText();
            this.scannedValue.emit(scannedText);
          }
        }).catch((err) => {
          console.error('Error de escaneo:', err);
        });

      })
      .catch(err => alert('Error al acceder a la cámara: ' + err));
  }

  stop() {
    if (this.codeReader) {
      this.codeReader.reset();
    }
    if(this.lastStream) {
      this.lastStream.getTracks().forEach(track => track.stop()) 
    }
  }
}
