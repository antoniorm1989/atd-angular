import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-message',
  template: '✅ <span style="font-weight: bold;">La acción se realizó con éxito.</span><br/> Se ha iniciado sesión correctamente',
  styles: [],
})
export class MessageComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
