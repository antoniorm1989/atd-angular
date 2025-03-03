import { Component } from '@angular/core';
import { LoadingService } from 'src/app/components/genericos/loading/loading.service';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.css']
})
export class LoadingOverlayComponent {
  constructor(public loadingService: LoadingService) {}
}