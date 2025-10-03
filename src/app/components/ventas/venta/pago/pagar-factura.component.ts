import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CatalogoCuentaBancariaModel, CatalogoFormaPagoModel, CatalogoMonedaModel, CatalogoProductoServicioModel, CatalogoUnidadMedidaModel } from 'src/app/models/catalogos.model';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { VentaPagoModel } from 'src/app/models/ventas.model';
import { User } from 'src/app/models/user';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { CatalogoCuentaBancariaService } from 'src/app/services/catalogo-cuenta-bancaria.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { VentaService } from 'src/app/services/ventas.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingService } from 'src/app/components/genericos/loading/loading.service';
import { CancelarFacturaComponent } from '../cancelar/cancelar-factura.component';

@Component({
  selector: 'app-pagar-factura',
  templateUrl: './pagar-factura.component.html',
  styleUrls: ['./pagar-factura.component.css']
})

export class PagarFacturaComponent implements OnInit {

  form: FormGroup;
  submitted = false;
  monedas: CatalogoMonedaModel[] = [];
  formaPagoList: CatalogoFormaPagoModel[] = [];

  selectedFormaPago!: CatalogoFormaPagoModel;
  selectedCondicionPago = "contado";

  cuentasBancarias: CatalogoCuentaBancariaModel[] = [];
  selectedCuentaBancaria: CatalogoCuentaBancariaModel | undefined;

  metodoPagoList: CatalogoFormaPagoModel[] = [];
  selectedMetodoPago: CatalogoFormaPagoModel | null = null;

  // Pagos y abonos
  hasRecordsPagos = false;
  displayedColumnsPagos: string[] = ['fecha', 'monto', 'forma_pago', 'cuenta', 'cfdi', 'estatus', 'acciones'];
  dataSourcePagos = new MatTableDataSource<VentaPagoModel>([]);
  @ViewChild(MatPaginator) paginatorPagos!: MatPaginator;

  wizardStep = 1
  venta_factura_id: number;
  total: number = 0;
  moneda_venta_id: number = 1;
  moneda: string = 'MXN';
  pendiente: number = 0;
  metodo_pago_key = 'PPD';

  selectedPago: VentaPagoModel | null = null;
  isEditing = false;

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private catalogosService: CatalogosService,
    private catalogoArticuloService: CatalogoArticuloService,
    private catalogoCuentaBancariaService: CatalogoCuentaBancariaService,
    private dialogRef: MatDialogRef<PagarFacturaComponent>,
    private ventaService: VentaService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private loadingService: LoadingService,
    private dialog: MatDialog) {

    this.venta_factura_id = data.venta_factura_id || 0;
    this.total = data.total || 0;
    this.moneda_venta_id = data.moneda_venta_id || 1;
    this.metodo_pago_key = data.metodo_pago_key || 'PPD';

    const idx = this.displayedColumnsPagos.indexOf('estatus');
    if (this.metodo_pago_key != 'PPD') {
      if (idx !== -1) {
        this.displayedColumnsPagos.splice(idx, 1);
      }
    }

    let tipoCambioDefault = this.getTipoCambioDefault();

    this.form = this.formBuilder.group({
      monto: ['', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{1,2})?$/),
        this.maxMontoValidator.bind(this)
      ]],
      referencia: [null, Validators.required],
      cuenta_bancaria: [null, Validators.required],
      moneda: [this.moneda, Validators.required],
      tipo_cambio: tipoCambioDefault,
      forma_pago: [null, Validators.required],
      metodo_pago: [{ value: null, disabled: true }, Validators.required],
    });
  }

  ngOnInit() {
    try {
      this.catalogoArticuloService.getMonedas().subscribe({
        next: (data) => {
          this.monedas = data;
          let selectedMoneda = data.find(x => x.id == this.moneda_venta_id);
          if (selectedMoneda != undefined) {
            this.form.patchValue({ moneda: selectedMoneda });
            this.moneda = selectedMoneda.moneda ? selectedMoneda.moneda : 'MXN';
          }
        }
      });

      this.catalogosService.getMetodoPago().subscribe({
        next: (data) => {
          if (data.length > 0) {
            this.metodoPagoList = data;
            this.selectedMetodoPago = data.find(x => x.key === this.metodo_pago_key) || null;
            if (this.selectedMetodoPago) {
              this.form.patchValue({ metodo_pago: this.selectedMetodoPago });
            }
          }
        },
        error: (e) => {
          console.log(e);
        }
      });

      this.catalogoCuentaBancariaService.getAll().subscribe({
        next: (data) => {
          this.cuentasBancarias = data;
          this.selectedCuentaBancaria = data[0];
          this.form.patchValue({ cuenta_bancaria: data[0] });
        },
        error: (e) => {
          console.log(e);
        }
      });

      this.obtenerPagos();

      this.loadFormaPagoSelect();

      // Listen for changes in the moneda field and re-validate monto
      this.form.get('moneda')?.valueChanges.subscribe(() => {
        this.form.get('monto')?.updateValueAndValidity();
      });

      // Listen for changes in the tipo_cambio field and re-validate monto
      this.form.get('tipo_cambio')?.valueChanges.subscribe(() => {
        this.form.get('monto')?.updateValueAndValidity();
      });

    } catch (error) {
      console.error('An error occurred in ngOnInit:', error);
    }
  }

  get f() { return this.form!.controls; }

  calcularRestante(): number {
    const monto = this.f['monto'].value ? parseFloat(this.f['monto'].value) : 0;
    const monedaPendiente = this.moneda;
    const monedaDeposito = this.f['moneda'].value?.moneda || this.f['moneda'].value;
    const tipoCambio = this.f['tipo_cambio'].value ? parseFloat(this.f['tipo_cambio'].value) : 1;

    // Si ambas monedas son iguales
    if (monedaPendiente === monedaDeposito) {
      return this.pendiente - monto;
    }

    // Si el pendiente es USD y el depósito es MXN (convertir MXN a USD)
    if (monedaPendiente === 'USD' && monedaDeposito === 'MXN') {
      if (!tipoCambio || tipoCambio === 0) return this.pendiente; // Evita división por cero
      return this.pendiente - (monto / tipoCambio);
    }

    // Si el pendiente es MXN y el depósito es USD (convertir USD a MXN)
    if (monedaPendiente === 'MXN' && monedaDeposito === 'USD') {
      return this.pendiente - (monto * tipoCambio);
    }

    // Default (por si acaso)
    return this.pendiente - monto;
  }

  formatearComoMoneda(valor: number | undefined): string {
    if (valor === undefined || valor === null)
      return 'n/a';

    const moneda = this.form.get('moneda')?.value === 'USD' ? 'USD' : 'MXN';

    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(valor);
  }

  validarDecimal(event: any) {
    const allowedChars = /[0-9\.\,]/;
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (!allowedKeys.includes(event.key) && !allowedChars.test(event.key)) {
      event.preventDefault();
    }

    const input = event.target as HTMLInputElement;
    const value = input.value.replace(',', '.');
    const regexp = new RegExp(/^\d+(\.\d{0,2})?$/);

    if (!regexp.test(value + event.key)) {
      event.preventDefault();
    }
  }

  validarFinal(controlName: string) {
    const value = this.f[controlName].value;

    // Skip validation if value is empty (let required validator handle it)
    if (!value || value.toString().trim() === '') {
      return;
    }

    const regexp = /^\d+(\.\d{1,2})?$/;

    if (!regexp.test(value)) {
      this.f[controlName].setErrors({ pattern: true });
      return;
    }

    // Clear pattern error if valid
    if (this.f[controlName].hasError('pattern')) {
      const errors = { ...this.f[controlName].errors };
      delete errors['pattern'];
      this.f[controlName].setErrors(Object.keys(errors).length > 0 ? errors : null);
    }

    // Revalidate monto when restante might have changed
    if (controlName === 'monto') {
      this.form.get('monto')?.updateValueAndValidity();
    }
  }

  getTipoCambioDefault(): number {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (userData.configuraciones && userData.configuraciones.length > 0) {
      let configuracion = userData.configuraciones.find((config: any) => config.name === 'tipo_cambio');
      if (configuracion) {
        return configuracion.value;
      }
    }
    return 0;
  }

  onCondicionPagoChange(event: any) {
    this.loadFormaPagoSelect();
  }

  loadFormaPagoSelect() {
    this.catalogosService.getFormaPagoById(this.selectedCondicionPago == 'contado' ? 0 : 1).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.formaPagoList = data;
          this.selectedFormaPago = data[0];
          this.form.patchValue({ forma_pago: data[0] });
        }
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  // Custom validator to prevent deposit amount from exceeding restante
  maxMontoValidator(control: AbstractControl): ValidationErrors | null {
    if (this.form && this.calcularRestante() < 0) {
      return { maxMonto: true };
    }
    return null;
  }

  onAdd() {
    try {
      this.submitted = true;

      // Validate form and show errors if invalid
      if (!this.validateForm()) {
        return;
      }

      // Validate business rules
      if (!this.validateBusinessRules()) {
        return;
      }

      let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
      let user = new User();
      user.id = userData.id;

      // Create and populate the payment model
      const ventaPagoModel = new VentaPagoModel();
      ventaPagoModel.deposito = parseFloat(this.f['monto'].value);
      ventaPagoModel.referencia = this.f['referencia'].value?.trim();
      ventaPagoModel.cuentaBancaria = this.f['cuenta_bancaria'].value;
      ventaPagoModel.moneda = this.f['moneda'].value;
      ventaPagoModel.tipoCambio = parseFloat(this.f['tipo_cambio'].value);
      ventaPagoModel.formaPago = this.f['forma_pago'].value;
      ventaPagoModel.metodoPago = this.f['metodo_pago'].value;
      ventaPagoModel.usuario = user;

      // Save the payment (create or update)
      this.saveVentaPago(ventaPagoModel);

    } catch (error) {
      console.error('An error occurred in onAdd:', error);
      this.submitted = false;
    }
  }

  private validateForm(): boolean {
    if (this.form.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });

      console.warn('Form is invalid, validation errors:', this.getFormErrors());
      return false;
    }
    return true;
  }

  private validateBusinessRules(): boolean {
    // Validate deposit amount doesn't exceed restante
    const montoValue = parseFloat(this.f['monto'].value);
    if (isNaN(montoValue) || montoValue <= 0) {
      this.f['monto'].setErrors({ required: true });
      this.f['monto'].markAsTouched();
      return false;
    }

    if (this.calcularRestante() < 0) {
      this.f['monto'].setErrors({ maxMonto: true });
      this.f['monto'].markAsTouched();
      return false;
    }

    return true;
  }

  private saveVentaPago(ventaPagoModel: VentaPagoModel): void {

    this.loadingService.show();
    if (this.isEditing && this.selectedPago?.id) {
      // Update existing payment
      this.ventaService.updatePago(this.selectedPago?.id, ventaPagoModel).subscribe({
        next: (data) => {
          this.loadingService.hide();
          this.openSnackBarSuccess('¡Pago acta exitosamente!');
          this.resetFormAndReturn();
          this.obtenerPagos();

        },
        error: (error) => {
          this.loadingService.hide();
          this.openSnackBarError('Error al registrar el pago. Inténtalo de nuevo.');
          this.resetFormAndReturn();
          this.obtenerPagos();
        }
      });
    } else {
      // Create new payment
      this.ventaService.createPago(this.venta_factura_id, ventaPagoModel).subscribe({
        next: (data) => {
          this.loadingService.hide();
          this.openSnackBarSuccess('¡Pago registrado exitosamente!');
          this.resetFormAndReturn();
          this.obtenerPagos();
        },
        error: (error) => {
          this.loadingService.hide();
          this.openSnackBarError('Error al registrar el pago. Inténtalo de nuevo.');
          this.resetFormAndReturn();
          this.obtenerPagos();
        }
      });
    }
  }

  cancelarWizard() {
    this.resetFormAndReturn();
  }

  openSnackBarSuccess(message: string) {
    this.snackBar.open(message, 'cerrar', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
      duration: 5000,
    });
  }

  openSnackBarError(message: string) {
    this.snackBar.open(message, 'cerrar', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
      duration: 5000,
    });
  }

  private getFormErrors(): any {
    const formErrors: any = {};
    Object.keys(this.form.controls).forEach(key => {
      const controlErrors = this.form.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  onCancel() {
    this.dialogRef.close({ totalPagado: this.total - this.pendiente });
  }

  obtenerPagos() {
    this.hasRecordsPagos = false;
    this.ventaService.getPagos(this.venta_factura_id).subscribe({
      next: (data) => {
        this.dataSourcePagos.data = data;
        this.dataSourcePagos._updateChangeSubscription();
        this.hasRecordsPagos = this.dataSourcePagos.data.length > 0;
        this.pendiente = this.total - data.reduce((sum, pago) => sum + (parseFloat(String(pago.deposito)) || 0), 0);
        if (this.paginatorPagos) {
          this.dataSourcePagos.paginator = this.paginatorPagos;
        }
      },
      error: (e) => {
        console.error('Error al obtener los pagos:', e);
      }
    });
  }


  onSelectPago(pago: VentaPagoModel) {
    this.selectedPago = pago;
    this.isEditing = true;
    this.wizardStep = 2;

    const cuentaBancaria = this.cuentasBancarias.find(cb => cb.id === pago.cuentaBancaria?.id);
    const formaPago = this.formaPagoList.find(fp => fp.id === pago.formaPago?.id);
    const metodoPago = this.metodoPagoList.find(mp => mp.id === pago.metodoPago?.id);
    const moneda = this.monedas.find(m => m.moneda === pago.moneda) || pago.moneda;

    this.form.patchValue({
      monto: pago.deposito,
      cuenta_bancaria: cuentaBancaria,
      moneda: moneda,
      tipo_cambio: pago.tipoCambio,
      referencia: pago.referencia,
      forma_pago: formaPago,
      metodo_pago: metodoPago
    });
  }

  onDeletePago(pago: VentaPagoModel) {
    if (!pago.id) {
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este pago?')) {
      this.ventaService.deletePago(pago.id).subscribe({
        next: () => {
          this.openSnackBarSuccess('¡Pago eliminado exitosamente!');
          this.resetFormAndReturn();
          this.obtenerPagos();
        },
        error: () => {
          this.openSnackBarError('Error al eliminar el pago. Inténtalo de nuevo.');
          this.resetFormAndReturn();
          this.obtenerPagos();
        }
      });
    }
  }

  generarComplemento(pagoId: number) {
    if (!pagoId) {
      this.openSnackBarError('No se puede generar el complemento. Falta información del pago.');
      return;
    }

    this.loadingService.show();
    this.ventaService.generarComplementoPago(pagoId).subscribe({
      next: (data) => {
        this.loadingService.hide();
        this.openSnackBarSuccess('¡Complemento de pago generado exitosamente!');
        this.resetFormAndReturn();
        this.obtenerPagos();
      },
      error: (e) => {
        this.loadingService.hide();
        console.error('Error al generar el complemento de pago:', e);
        this.openSnackBarError('Error al generar el complemento de pago. Inténtalo de nuevo.');
        this.resetFormAndReturn();
        this.obtenerPagos();
      }
    });
  }

  resetFormAndReturn() {
    this.form.reset();

    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsPristine();
      this.form.get(key)?.markAsUntouched();
      this.form.get(key)?.updateValueAndValidity();
    });

    this.selectedPago = null;
    this.isEditing = false;
    this.submitted = false;
    this.wizardStep = 1;

    this.setDefaultFormValues();
  }

  setDefaultFormValues() {
    if (this.cuentasBancarias.length > 0) {
      this.form.patchValue({ cuenta_bancaria: this.cuentasBancarias[0] });
    }
    if (this.formaPagoList.length > 0) {
      this.form.patchValue({ forma_pago: this.formaPagoList[0] });
    }
    if (this.metodoPagoList.length > 0) {
      this.form.patchValue({ metodo_pago: this.metodoPagoList[0] });
    }
    if (this.monedas.length > 0) {
      this.form.patchValue({ moneda: this.monedas.find(x => x.id == this.moneda_venta_id) || this.monedas[0] });
    }
  }

  descargarFacturaPDF(cfdi_uid: string) {
    if (!cfdi_uid) {
      this.openSnackBarError('No se ha generado la factura aún.');
    } else {
      this.loadingService.show();
      this.ventaService.descargarFactura(cfdi_uid, 'pdf').subscribe({
        next: (data) => {
          this.loadingService.hide();
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          // Descarga el archivo en lugar de abrirlo
          const link = document.createElement('a');
          link.href = url;
          link.download = `cfdi_${cfdi_uid}.pdf`;
          link.click();

          window.URL.revokeObjectURL(url);
        },
        error: (e) => {
          console.log(e);
        }
      });
    }
  }

  descargarFacturaXML(cfdi_uid: string) {
    if (!cfdi_uid) {
      this.openSnackBarError('No se ha generado la factura aún.');
    } else {
      this.loadingService.show();
      this.ventaService.descargarFactura(cfdi_uid, 'xml').subscribe({
        next: (data) => {
          this.loadingService.hide();

          const blob = new Blob([data], { type: 'application/xml' });
          const url = window.URL.createObjectURL(blob);

          // Descarga el archivo en lugar de abrirlo
          const link = document.createElement('a');
          link.href = url;
          link.download = `cfdi_${cfdi_uid}.xml`;
          link.click();

          window.URL.revokeObjectURL(url);
        },
        error: (e) => {
          console.log(e);
        }
      });
    }
  }

  openCancelarFacturaModal(facturaData?: any) {
    const dialogRef = this.dialog.open(CancelarFacturaComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        folio: facturaData?.cfdi_uid || '',
        facturaId: facturaData?.id,
      }
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result && result.canceled) {
        console.log('Factura cancelada con motivo:', result.motivo);
        console.log('UUID de sustitución:', result.uuid_sustitucion);
        this.cancelarFactura(facturaData?.id, result.motivo, result.uuid_sustitucion, facturaData?.cfdi_uid);
      }
    });
  }

  private cancelarFactura(complementoPagoId: number, motivo: any, uuidSustitucion?: string, cfdi_uid?: string) {
    const cancelData = {
      motivo: motivo.clave,
      uuid_sustitucion: uuidSustitucion,
      uuid_cancelar: cfdi_uid
    };

    this.loadingService.show();
    this.ventaService.cancelarFacturaComplementoPago(complementoPagoId, cancelData).subscribe({
      next: (response: any) => {
        console.log('Factura cancelada exitosamente:', response);
        this.obtenerPagos();
        //this.openSnackBarSuccess('Factura cancelada correctamente');
        this.loadingService.hide();
      },
      error: (e: any) => {
        console.error('Error al cancelar factura:', e.error.detalles);
        //this.openDialogError('Error al cancelar la factura: ' + e.error.detalles);
        this.loadingService.hide();
      }
    });
  }

}