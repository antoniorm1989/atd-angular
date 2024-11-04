import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MessageComponent } from 'src/app/components/genericos/snack-message.component';
import { VentaModel } from 'src/app/models/ventas.model';
import { VentaService } from 'src/app/services/ventas.service';


@Component({
  selector: 'app-cancelar-factura',
  templateUrl: './cancelar-factura.component.html',
  styleUrls: ['./cancelar-factura.component.css']
})

export class CancelarFacturaComponent implements OnInit, OnDestroy {

  @Output() regresar = new EventEmitter();
  @Output() cancelar = new EventEmitter();
  @Input() ventaId: number = 0;
  @Input() venta: VentaModel = new VentaModel();
  form: FormGroup;


  constructor(private formBuilder: FormBuilder, private _snackBar: MatSnackBar) {
    this.form = this.formBuilder.group({
      fecha_cancelacion: new Date(),
      comentarios: "",
      motivoCancelacion: '01'
    });
  }

  get f() { return this.form!.controls; }

  ngOnInit() {
    try {
    } catch (error) {
      console.error('An error occurred in ngOnInit:', error);
    }
  }

  ngOnDestroy() {
  }

  onCancelar() {
    try {
    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }

  onRegresar() {
    try {
      this.regresar.emit();
    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }

  filterFutureDates = (date: Date | null): boolean => {
    // Disable past dates
    const currentDate = new Date();
    return !date || date <= currentDate;
  }

  onSubmit() {
    this.openMessageSnack();
    this.regresar.emit();
  }

  openMessageSnack() {
    const config: MatSnackBarConfig = {
      duration: 5000,
      data: {
        html: '✅ <b>¡En hora buena!</b><br/> Se ha cancelado con éxito la factura. Podrás visualizarla en tu listado de Facturas.',
      },
    };
    this._snackBar.openFromComponent(MessageComponent, config);
  }
}