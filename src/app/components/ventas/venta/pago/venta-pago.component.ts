import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryAlmacenService } from 'src/app/services/inventory.service';
import { CatalogoAlmacenesService } from 'src/app/services/catalogo-almacenes.service';
import { CatalogoAlmacenModel } from 'src/app/models/catalogo-almacen.model';
import { environment } from 'src/environments/environment';
import { InventoryAlmacenModel } from 'src/app/models/inventory-almacen.model';
import { Observable, map, startWith } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BarcodeScannerComponent } from 'src/app/components/genericos/barcodesScanner.component';
import { MatRadioChange } from '@angular/material/radio';
import { CatalogoSucursalModel } from 'src/app/models/catalogo-sucursal.model';
import { CatalogoSucursalesService } from 'src/app/services/catalogo-sucursales.service';
import { CatalogoCuentaBancariaModel, CatalogoFormaPagoModel, CatalogoMonedaModel, CatalogoProductoServicioModel, CatalogoUnidadMedidaModel } from 'src/app/models/catalogos.model';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { VentaPagoModel } from 'src/app/models/ventas.model';
import { InventorySucursalModel } from 'src/app/models/inventory-sucursal.model';
import { User } from 'src/app/models/user';
import { VentaService } from 'src/app/services/ventas.service';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { CatalogoCuentaBancariaService } from 'src/app/services/catalogo-cuenta-bancaria.service';


@Component({
  selector: 'app-venta-pago',
  templateUrl: './venta-pago.component.html',
  styleUrls: ['./venta-pago.component.css']
})

export class VentaPagoComponent implements OnInit {

  action: string = 'Agregar';
  form: FormGroup;
  submitted = false;
  monedas: CatalogoMonedaModel[] = [];
  formaPagoList: CatalogoFormaPagoModel[] = [];

  selectedFormaPago!: CatalogoFormaPagoModel;
  selectedCondicionPago = "contado";

  cuentasBancarias: CatalogoCuentaBancariaModel[] = [];
  selectedCuentaBancaria: CatalogoCuentaBancariaModel | undefined;

  metodoPagoList: CatalogoFormaPagoModel[] = [];
  selectedMetodoPago!: CatalogoFormaPagoModel;

  @Output() cancel = new EventEmitter();
  @Output() add = new EventEmitter<boolean>();
  @Input() ventaPagoModel: VentaPagoModel | undefined;
  @Input() ventaId: number = 0;
  @Input() importeTotal: number = 0;
  @Input() moneda: string = 'MXN';

  private _saldo: number = 0;
  @Input()
  get saldo(): number {
    return this._saldo;
  }
  set saldo(value: number) {
    this._saldo = value;
    // Revalidate deposito when saldo changes
    if (this.form) {
      this.form.get('deposito')?.updateValueAndValidity();
    }
  }

  isEditing: boolean = false;

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private catalogosService: CatalogosService,
    private ventaService: VentaService,
    private catalogoArticuloService: CatalogoArticuloService,
    private catalogoCuentaBancariaService: CatalogoCuentaBancariaService) {

    let tipoCambioDefault = this.getTipoCambioDefault();

    this.form = this.formBuilder.group({
      deposito: ['', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{1,2})?$/),
        this.maxDepositoValidator.bind(this)
      ]],
      referencia: [null, Validators.required],
      cuenta_bancaria: [null, Validators.required],
      moneda: [this.moneda, Validators.required],
      tipo_cambio: tipoCambioDefault,
      condicion_pago: ['contado'],
      forma_pago: [],
      metodo_pago: []
    });
  }

  ngOnInit() {
    try {
      if (this.ventaPagoModel != null) {
        this.isEditing = true;
        this.action = 'Editar';
      }

      this.catalogoArticuloService.getMonedas().subscribe({
        next: (data) => {
          this.monedas = data;
          let selectedMoneda = data.find(x => x.moneda == this.moneda);
          if (selectedMoneda != undefined)
            this.form.patchValue({ moneda: selectedMoneda });
        }
      });

      this.catalogosService.getMetodoPago().subscribe({
        next: (data) => {
          if (data.length > 0) {
            this.metodoPagoList = data;
            if (this.isEditing) {
              let selectedMetodoPago = data.find(x => x.id == this.ventaPagoModel?.metodoPago?.id);
              if (selectedMetodoPago != undefined)
                this.form.patchValue({ metodo_pago: selectedMetodoPago });
            }
            else
              this.selectedMetodoPago = data[0];
          }
        },
        error: (e) => {
          console.log(e);
        }
      });

      this.catalogoCuentaBancariaService.getAll().subscribe({
        next: (data) => {
          this.cuentasBancarias = data;
          if (this.isEditing) {
            let selectedCuentaBancaria = data.find(x => x.id == this.ventaPagoModel?.cuentaBancaria?.id);
            if (selectedCuentaBancaria != undefined)
              this.form.patchValue({ cuenta_bancaria: selectedCuentaBancaria });
          }
          else
            this.selectedCuentaBancaria = data[0];
        },
        error: (e) => {
          console.log(e);
        }
      });

      this.loadFormaPagoSelect();

      // Listen for changes in the moneda field and re-validate deposito
      this.form.get('moneda')?.valueChanges.subscribe(() => {
        this.form.get('deposito')?.updateValueAndValidity();
      });

      // Listen for changes in the tipo_cambio field and re-validate deposito
      this.form.get('tipo_cambio')?.valueChanges.subscribe(() => {
        this.form.get('deposito')?.updateValueAndValidity();
      });

    } catch (error) {
      console.error('An error occurred in ngOnInit:', error);
    }
  }

  get f() { return this.form!.controls; }

  calcularRestante(): number {
    const deposito = this.f['deposito'].value ? parseFloat(this.f['deposito'].value) : 0;

    if (this.moneda === 'USD' && this.f['moneda'].value.moneda === 'USD')
      return this.saldo - deposito;

    if (this.moneda === 'MXN' && this.f['moneda'].value.moneda === 'MXN')
      return this.saldo - deposito;

    if (this.moneda === 'USD' && this.f['moneda'].value.moneda === 'MXN') {
      const tipoCambio = this.f['tipo_cambio'].value ? parseFloat(this.f['tipo_cambio'].value) : 1;
      return this.saldo - (deposito / tipoCambio);
    }

    if (this.moneda === 'MXN' && this.f['moneda'].value.moneda === 'USD') {
      const tipoCambio = this.f['tipo_cambio'].value ? parseFloat(this.f['tipo_cambio'].value) : 1;
      return this.saldo - (deposito * tipoCambio);
    }
    return this.saldo - deposito; // Default case, should not happen
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

    // Revalidate deposito when saldo might have changed
    if (controlName === 'deposito') {
      this.form.get('deposito')?.updateValueAndValidity();
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
          if (this.isEditing) {
            let selectedFormaPago = data.find(x => x.id == this.ventaPagoModel?.formaPago?.id);
            if (selectedFormaPago != undefined)
              this.form.patchValue({ forma_pago: selectedFormaPago });
          }
          else
            this.selectedFormaPago = data[0];
        }
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  // Custom validator to prevent deposit amount from exceeding saldo
  maxDepositoValidator(control: AbstractControl): ValidationErrors | null {
    if(this.form && this.calcularRestante() < 0) {
      return { maxDeposito: true };
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
      ventaPagoModel.deposito = parseFloat(this.f['deposito'].value);
      ventaPagoModel.referencia = this.f['referencia'].value?.trim();
      ventaPagoModel.cuentaBancaria = this.f['cuenta_bancaria'].value;
      ventaPagoModel.moneda = this.f['moneda'].value;
      ventaPagoModel.tipoCambio = parseFloat(this.f['tipo_cambio'].value);
      ventaPagoModel.formaPago = this.f['forma_pago'].value;
      ventaPagoModel.metodoPago = this.f['metodo_pago'].value;
      ventaPagoModel.venta_id = this.ventaId;
      ventaPagoModel.usuario = user;


      // Set ID for editing
      if (this.isEditing && this.ventaPagoModel?.id) {
        ventaPagoModel.id = this.ventaPagoModel.id;
      }

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
    // Validate deposit amount doesn't exceed saldo
    const depositoValue = parseFloat(this.f['deposito'].value);
    if (isNaN(depositoValue) || depositoValue <= 0) {
      this.f['deposito'].setErrors({ required: true });
      this.f['deposito'].markAsTouched();
      return false;
    }

    if (this.calcularRestante() < 0) {
      debugger;
      this.f['deposito'].setErrors({ maxDeposito: true });
      this.f['deposito'].markAsTouched();
      return false;
    }

    // Validate that we have a valid venta_id for creating/updating payments
    if (this.isEditing && (!this.ventaPagoModel || !this.ventaPagoModel.venta_id)) {
      console.error('Cannot edit payment: missing venta_id');
      return false;
    }

    if (this.ventaId == 0 || !this.ventaId) {
      console.error('Cannot create payment: missing venta_id');
      return false;
    }

    return true;
  }

  private saveVentaPago(ventaPagoModel: VentaPagoModel): void {
    if (!ventaPagoModel.venta_id) {
      console.error('Cannot save payment: missing venta_id');
      return;
    }

    if (this.isEditing && ventaPagoModel.id) {
      // Update existing payment
      this.ventaService.updatePago(ventaPagoModel.venta_id, ventaPagoModel).subscribe({
        next: (data) => {
          console.log('Payment updated successfully', data);
          this.handleSaveSuccess(true);
        },
        error: (error) => {
          console.error('Error updating payment:', error);
          this.handleSaveError(error);
        }
      });
    } else {
      // Create new payment
      this.ventaService.createPago(ventaPagoModel.venta_id, ventaPagoModel).subscribe({
        next: (data) => {
          console.log('Payment created successfully', data);
          this.handleSaveSuccess(false);
        },
        error: (error) => {
          console.error('Error creating payment:', error);
          this.handleSaveError(error);
        }
      });
    }
  }

  private handleSaveSuccess(isUpdate: boolean): void {
    this.submitted = false;
    this.add.emit(isUpdate);

    // Optionally reset form after successful creation
    if (!isUpdate) {
      this.resetForm();
    }
  }

  private handleSaveError(error: any): void {
    this.submitted = false;
    // You could show a user-friendly error message here
    // For example, using a toast service or setting form errors
  }

  private resetForm(): void {
    this.form.reset();
    this.submitted = false;
    // Reset to default values
    this.form.patchValue({
      moneda: this.moneda,
      tipo_cambio: this.getTipoCambioDefault(),
      condicion_pago: 'contado'
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
    try {
      this.cancel.emit();
    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }

}