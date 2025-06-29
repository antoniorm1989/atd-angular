import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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

  subtotal: number = 0;

  @Output() cancel = new EventEmitter();
  @Output() add = new EventEmitter<VentaPagoModel>();
  @Input() ventaPagoModel: VentaPagoModel | undefined;

  isEditing: boolean = false;

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private catalogosService: CatalogosService,
    private dialog: MatDialog,
    private ventaService: VentaService,
    private catalogoArticuloService: CatalogoArticuloService) {

    let tipoCambioDefault = this.getTipoCambioDefault();

    this.form = this.formBuilder.group({
      deposito: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      referencia: [null, Validators.required],
      condicion_pago: ['contado'],
      moneda: ['MXN'],
      forma_pago: [],
      tipo_cambio: tipoCambioDefault,
      metodo_pago: []
    });
  }

  ngOnInit() {
    try {
      // add cuentas bancarias aqui
      // this.catalogoSucursalesService.getAll().subscribe({
      //   next: (data) => {
      //     this.sucursales = data;
      //     if (data.length > 0)
      //       this.selectedSucursal = data[0];
      //   },
      //   error: (e) => {
      //   }
      // });


      if (this.ventaPagoModel != null) {
        this.isEditing = true;
        this.action = 'Editar';
        // this.f['producto_servicio_model'].disable();
      }

      // Cuando se clcle importes
      // this.form.get('tipoDescuento')?.valueChanges.subscribe(value => {
      //   this.calcularSubTotal();
      // });

      this.catalogoArticuloService.getMonedas().subscribe({
        next: (data) => {
          this.monedas = data;
          this.f['moneda'].setValue(data[0]);
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

      this.loadFormaPagoSelect();

    } catch (error) {
      console.error('An error occurred in ngOnInit:', error);
    }
  }

  // loadEdit(ventaPagoModel: VentaPagoModel) {
  //       this.form.patchValue({
  //         selectedArticle: ventaPagoModel.almacen?.pago?.part_number,
  //         qty: this.isDespachar ? 0 : ventaPagoModel.cantidad,
  //         descuento: ventaPagoModel.descuento,
  //         comentarios: ventaPagoModel.comentarios,
  //         backorder: 0,
  //         unidad_medida: ventaPagoModel.unidad_medida,
  //         producto_servicio_model: ventaPagoModel.producto_servicio_model,
  //         unidad_medida_model: ventaPagoModel.unidad_medida_model
  //       });
  //     }
  // }

  get f() { return this.form!.controls; }

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

  calcularSubTotal() {
    //this.subtotal = ((this.calcularTotalConDescuento() * this.f['qty'].value));
  }

  // validarDecimal(event: any) {
  //   const allowedChars = /[0-9\.\,]/;
  //   const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

  //   if (!allowedKeys.includes(event.key) && !allowedChars.test(event.key)) {
  //     event.preventDefault();
  //   }

  //   const input = event.target as HTMLInputElement;
  //   const value = input.value.replace(',', '.');
  //   const regexp = new RegExp(/^\d+(\.\d{0,2})?$/);

  //   if (!regexp.test(value + event.key)) {
  //     event.preventDefault();
  //   }
  // }

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
    const regexp = /^\d+(\.\d{1,2})?$/;
    if (!regexp.test(value)) {
      this.f[controlName].setErrors({ pattern: true });
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

  onAdd() {
    // try {
    //   this.submitted = true;
    //     let ventaPagoModel = new VentaPagoModel();
    //     ventaPagoModel.inventory_almacen_id = this.inventory_almacen_id;
    //     ventaPagoModel.precio_venta = this.f['precio_venta'].value;
    //     ventaPagoModel.totalConDescuento = this.calcularTotalConDescuento();
    //     ventaPagoModel.descuento = this.f['descuento'].value;
    //     ventaPagoModel.tipoDescuento = this.f['tipoDescuento'].value;
    //     ventaPagoModel.cantidad = this.f['qty'].value;
    //     ventaPagoModel.backorder = this.f['backorder'].value;
    //     ventaPagoModel.comentarios = this.f['comentarios'].value;
    //     ventaPagoModel.moneda_nombre = this.f['moneda_nombre'].value;

    //     ventaPagoModel.unidad_medida = this.f['unidad_medida'].value;
    //     ventaPagoModel.producto_servicio_model = this.f['producto_servicio_model'].value;
    //     ventaPagoModel.unidad_medida_model = this.f['unidad_medida_model'].value;

    //     if (this.selectedAlmacen) {
    //       let inventoryAlmacenModel = new InventoryAlmacenModel();
    //       inventoryAlmacenModel.almacen = this.selectedAlmacen;
    //       inventoryAlmacenModel.pago = this.selectedArticle;
    //       ventaPagoModel.almacen = inventoryAlmacenModel;
    //     }

    //     if (this.selectedSucursal) {
    //       let inventorySucursalModel = new InventorySucursalModel();
    //       inventorySucursalModel.sucursal = this.selectedSucursal;
    //       inventorySucursalModel.pago = this.selectedArticle;
    //       ventaPagoModel.sucursal = inventorySucursalModel;
    //     }

    //     this.add.emit(ventaPagoModel);
    // } catch (error) {
    //   console.error('An error occurred in onSubmit:', error);
    // }
  }

  onCancel() {
    try {
      this.cancel.emit();
    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }

}