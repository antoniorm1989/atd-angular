import { Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { MessageComponent } from 'src/app/components/genericos/snack-message.component';
import { CatalogoProveedorModel } from 'src/app/models/catalogo-proveedor.model';
import { CatalogoFormaPagoModel, CatalogoObjetoImpuestoModel, CatalogoRegimenFiscalModel, CatalogoUsoCfdiModel } from 'src/app/models/catalogos.model';
import { User } from 'src/app/models/user';
import { CatalogoProveedoresService } from 'src/app/services/catalogo-proveedor.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { DialogSuccessComponent } from '../../genericos/dialogSuccess.component';
import { OrdenCompraArticuloModel, OrdenCompraModel } from 'src/app/models/orden-compa.model';
import { OrdenCompraService } from 'src/app/services/orden-compra.service';

@Component({
  selector: 'app-orden-compra',
  templateUrl: './orden-compra.component.html',
  styleUrls: ['./orden-compra.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class OrdenCompraComponent {

  action: string = 'view';
  title: string = '';
  form: FormGroup;
  submitted = false;
  id = 0;

  proveedores: CatalogoProveedorModel[] = [];
  selectedProveedor!: CatalogoProveedorModel;
  filteredProveedores!: Observable<CatalogoProveedorModel[]>;


  formaPagoList: CatalogoFormaPagoModel[] = [];
  selectedFormaPago!: CatalogoFormaPagoModel;

  metodoPagoList: CatalogoFormaPagoModel[] = [];
  selectedMetodoPago!: CatalogoFormaPagoModel;

  selectedCondicionPago = "contado";

  hasRecords = false;
  displayedColumns: string[] = ['numero_parte', 'descripcion', 'cantidad', 'almacen', 'precio_compra', 'importe', 'importe_iva', 'actions'];
  dataSourceArticulos = new MatTableDataSource<OrdenCompraArticuloModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  subTotal: number = 0;
  descuento: number = 0;
  iva: number = 0;
  retencion: number = 0;
  total: number = 0;

  editData!: OrdenCompraModel;

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private ordenCompraService: OrdenCompraService,
    private router: Router,
    private catalogoProveedoresService: CatalogoProveedoresService,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private catalogosService: CatalogosService,
    private dialog: MatDialog) {

    this.form = this.formBuilder.group({
      // Datos generales
      proveedor: [null, Validators.required],
      folio_interno: ['', Validators.required],
      fecha_registro: new Date(),
      comentarios: [''],
      // Forma pago
      condicion_pago: ['contado'],
      tiene_dias_credito: { value: false, disabled: true },
      cantidad_dias_credito: { value: 0, disabled: true },
      moneda: ['MXN'],
      forma_pago: [],
      metodo_pago: [],
      tipo_cambio: 0,
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url.includes('/ordenesCompra/detail')) {

        this.route.params.subscribe(params => {
          this.id = params['ordenCompraId'];
          if (this.id != undefined) {
            this.ordenCompraService.getById(this.id).subscribe({
              next: (data) => {

                var ordenCompra = data;
                this.editData = ordenCompra;

                this.form.patchValue({
                  // Datos generales
                  proveedor: ordenCompra.proveedor,
                  folio_interno: ordenCompra.folio_interno,
                  fecha_registro: ordenCompra.fecha_registro,
                  comentarios: ordenCompra.comentarios,
                  // Forma pago
                  condicion_pago: ordenCompra.condicion_pago,
                  tiene_dias_credito: ordenCompra.tiene_dias_credito,
                  cantidad_dias_credito: ordenCompra.cantidad_dias_credito,
                  moneda: ordenCompra.moneda,
                  forma_pago: ordenCompra.forma_pago,
                  metodo_pago: ordenCompra.metodo_pago,
                  tipo_cambio: ordenCompra.tipo_cambio
                });

                this.dataSourceArticulos.data = ordenCompra.articulos || [];
                this.hasRecords = this.dataSourceArticulos.data.length > 0;

                this.calcularTotales();
                this.loadSelectData();

                this.route.queryParams.subscribe(params => {
                  switch (params['action']) {
                    case undefined:
                      this.action = 'view';
                      this.title = 'Consultar ordenCompra';
                      break;
                    case 'edit':
                      this.action = 'edit';
                      this.title = 'Editar ordenCompra';
                      break;
                  }
                });
              },
              error: (e) => {
              }
            });
          } else {
            this.action = 'new';
            this.title = 'Crear ordenCompra';
            this.loadSelectData();
          }
        });
      }
    });
  }

  get f() { return this.form!.controls; }

  get isReadOnly() {
    return this.action == 'view';
  }

  onSubmit() {
    this.submitted = true;

    if (this.dataSourceArticulos.data.length == 0) {
      this.openSnackBarError('Debes agregar al menos un artículo para continuar.');
      return
    }

    // stop here if form is invalid
    if (this.form!.invalid)
      return;

    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","lastname":""}');
    let user = new User();
    user.id = userData.id;

    let ordenCompra = new OrdenCompraModel();
    // Datos generales
    ordenCompra.id = this.id;
    ordenCompra.folio_interno = this.f['folio_interno'].value;
    ordenCompra.fecha_registro = this.f['fecha_registro'].value;
    ordenCompra.comentarios = this.f['comentarios'].value;
    ordenCompra.responsable = user;
    ordenCompra.proveedor = this.f['proveedor'].value;
    // forma pago
    ordenCompra.condicion_pago = this.f['condicion_pago'].value;
    ordenCompra.tiene_dias_credito = this.f['tiene_dias_credito'].value;
    ordenCompra.cantidad_dias_credito = this.f['cantidad_dias_credito'].value;
    ordenCompra.moneda = this.f['moneda'].value;
    ordenCompra.tipo_cambio = this.f['tipo_cambio'].value;
    ordenCompra.forma_pago = this.f['forma_pago'].value;
    ordenCompra.metodo_pago = this.f['metodo_pago'].value;
    // Articulos
    ordenCompra.articulos = this.dataSourceArticulos.data;

    if (this.action == 'new') {
      this.ordenCompraService.create(ordenCompra).subscribe({
        next: (data) => {
          this.openDialogSuccess(`Se ha creado con éxito la orden de compra #${data.id},  podrás visualizarlo desde tu listado ordenes de compra.`)
          this.router.navigate(['ordenesCompra']);
        },
        error: (e) => {
          console.log(e);
        }
      });
    }
  }

  openDialogSuccess(comment: string): void {
    const dialogRef = this.dialog.open(DialogSuccessComponent, {
      width: '710px',
      data: { title: '¡ En hora buena !', content: comment }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  formatDate(stringDate: string): string {
    const date = new Date(stringDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${month}/${day}/${year}`;
  }

  makeEditMode() {
    this.action = 'edit';
    this.title = 'Editar articulo';
    this.form.enable();
  }

  openMessageSnack() {
    const config: MatSnackBarConfig = {
      duration: 5000,
      data: {
        html: '✅ <b>¡En hora buena!</b><br/> La acción se ha realizado con éxito',
      },
    };
    this._snackBar.openFromComponent(MessageComponent, config);
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

  loadSelectData() {
    this.catalogoProveedoresService.getAll().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.proveedores = data;
          this.filteredProveedores = this.form.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || '')),
          );
          if (this.editData != undefined)
            this.form.patchValue({ proveedor: this.proveedores.find(x => x.id == this.editData.proveedor?.id) });
        }
      },
      error: (e) => {
      }
    });


    this.catalogosService.getMetodoPago().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.metodoPagoList = data;
          if (this.editData != undefined) {
            let selectedMetodoPago = data.find(x => x.id == this.editData.metodo_pago?.id);
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
  }

  onCondicionPagoChange(event: any) {
    event.value == 'credito' ? this.form.controls['tiene_dias_credito'].enable() : this.form.controls['tiene_dias_credito'].disable();
    event.value == 'credito' && this.form.controls['tiene_dias_credito'].value == true ? this.form.controls['cantidad_dias_credito'].enable() : this.form.controls['cantidad_dias_credito'].disable();
    this.loadFormaPagoSelect();
  }

  onTieneDiasCreditoChange() {
    const tieneDiasCredito = this.form.get('tiene_dias_credito');
    if (tieneDiasCredito?.value) {
      this.form.controls['cantidad_dias_credito'].disable();
    } else {
      this.form.controls['cantidad_dias_credito'].enable();
    }
  }

  loadFormaPagoSelect() {
    this.catalogosService.getFormaPagoById(this.selectedCondicionPago == 'contado' ? 0 : 1).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.formaPagoList = data;
          if (this.editData != undefined) {
            let selectedFormaPago = data.find(x => x.id == this.editData.forma_pago?.id);
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

  private _filter(value: any): CatalogoProveedorModel[] {
    let filterValue = "";
    if (value.proveedor) {
      filterValue = value.proveedor.nombre_fiscal || value.proveedor;
      filterValue = filterValue.toLowerCase();
    }
    return this.proveedores.filter(option => (option.nombreContacto!.toLowerCase()).concat(option.apellidoContacto!.toLowerCase()).includes(filterValue));
  }

  clearAutocompleteInput() {
    try {
      this.f['proveedor'].reset();
    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  clearAutocompleteInputVendedor() {
    try {
      this.f['vendedor'].reset();
    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  removeArticulo(articulo: OrdenCompraArticuloModel) {
    const indexToRemove = this.dataSourceArticulos.data.findIndex(item => item.almacen?.articulo?.id === articulo.almacen?.articulo?.id);
    if (indexToRemove !== -1) {
      this.dataSourceArticulos.data.splice(indexToRemove, 1);
      this.dataSourceArticulos._updateChangeSubscription();
    }

    if (this.dataSourceArticulos.data.length == 0)
      this.hasRecords = false;
  }

  calcularImporteByArticulo(costo: number, cantidad: number, descuento: number): string {
    return this.formatearComoMoneda((costo * cantidad) - descuento);
  }

  calcularImporteByArticuloIva(costo: number, cantidad: number, descuento: number): string {
    if (this.f['translada_iva'].value == true) {
      return this.formatearComoMoneda((((costo * cantidad) - descuento)) * this.f['translada_iva_porcentaje'].value);
    } else
      return this.formatearComoMoneda(0);
  }

  calcularImporteByArticuloRetencion(costo: number, cantidad: number, descuento: number): string {
    if (this.f['retiene_iva'].value == true) {
      return this.formatearComoMoneda((((costo * cantidad) - descuento)) * this.f['retiene_iva_porcentaje'].value);
    } else
      return this.formatearComoMoneda(0);
  }

  formatearComoMoneda(valor: number | undefined): string {
    if (!valor && valor != 0)
      return 'n/a';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }

  getPathPhoto(photo: string): string {
    return `${environment.apiUrl}/images/articulos/${photo}`
  }

  openArticuloOrdenCompraModalComponent() {
    const dialogRef = this.dialog.open(ArticuloOrdenCompraModalComponent, {
      height: '750px',
      data: {
        articulos: this.dataSourceArticulos.data,
        proveedorId: this.f['proveedor'].value ? this.f['proveedor'].value.id : 0
      },
    });

    dialogRef.afterClosed().subscribe(ordenCompraArticuloModel => {
      if (ordenCompraArticuloModel != undefined && ordenCompraArticuloModel != "") {
        this.dataSourceArticulos.data.push(ordenCompraArticuloModel);
        this.dataSourceArticulos._updateChangeSubscription();
        this.hasRecords = true;
        this.calcularTotales();
      }
    });
  }

  editArticuloOrdenCompraModalComponent(ordenCompraArticuloModel: OrdenCompraArticuloModel) {
    ordenCompraArticuloModel.id = this.id;
    const dialogRef = this.dialog.open(ArticuloOrdenCompraModalComponent, {
      height: '750px',
      data: {
        articulo: ordenCompraArticuloModel,
        proveedorId: this.f['proveedor'].value ? this.f['proveedor'].value.id : 0
      }
    });

    dialogRef.afterClosed().subscribe(ordenCompraArticuloModel => {
      if (ordenCompraArticuloModel && ordenCompraArticuloModel !== "") {
        const existingIndex = this.dataSourceArticulos.data.findIndex(item => item.almacen?.articulo?.id === ordenCompraArticuloModel.almacen?.articulo?.id);
        if (existingIndex !== -1) {
          // Si existe un objeto con el mismo id, elimínalo
          this.dataSourceArticulos.data.splice(existingIndex, 1);
        }
        // Agrega el nuevo objeto
        this.dataSourceArticulos.data.push(ordenCompraArticuloModel);
        this.dataSourceArticulos._updateChangeSubscription();
        this.hasRecords = true;
        this.calcularTotales();
      }
    });
  }

  despacharArticuloOrdenCompraModalComponent(ordenCompraArticuloModel: OrdenCompraArticuloModel) {
    ordenCompraArticuloModel.id = this.id;
    const dialogRef = this.dialog.open(ArticuloOrdenCompraModalComponent, {
      height: '550px',
      data: {
        articulo: ordenCompraArticuloModel,
        isDespachar: true
      }
    });

    dialogRef.afterClosed().subscribe(ordenCompraArticuloModel => {
      this.router.navigate(['ordenesCompra']);
    });
  }

  calcularTotales() {
    this.calcularSubTotal();
    this.calcularIva();
    this.calcularRetencion();
    this.calcularTotal();
  }

  calcularSubTotal() {
    this.subTotal = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      this.subTotal += (articulo.precio_orden_compra ?? 0) * (articulo.cantidad ?? 0);
    });
  }

  calcularIva() {
    this.iva = 0;
    if (this.f['translada_iva'].value == true)
      this.dataSourceArticulos.data.forEach(articulo => {
        this.iva += ((articulo.precio_orden_compra ?? 0) * (articulo.cantidad ?? 0)) * this.f['translada_iva_porcentaje'].value;
      });
  }

  calcularRetencion() {
    this.retencion = 0;
    if (this.f['retiene_iva'].value == true)
      this.dataSourceArticulos.data.forEach(articulo => {
        this.retencion += ((articulo.precio_orden_compra ?? 0) * (articulo.cantidad ?? 0)) * this.f['retiene_iva_porcentaje'].value;
      });
  }

  calcularTotal() {
    this.total = this.subTotal - this.descuento + this.iva - this.retencion;
  }

  // onProveedorSelectionChange(event: any) {
  //   if (event.source._selected == true) {
  //     this.selectedProveedor = event.source.value;

  //     let regimenFiscal = this.regimenesFiscales.find(x => x.id == this.selectedProveedor.regimen_fiscal?.id);
  //     if (regimenFiscal != undefined)
  //       this.selectedRegimenFiscal = regimenFiscal;

  //     this.form.patchValue({
  //       nombre_fiscal: this.selectedProveedor?.nombre_fiscal,
  //       regimen_fiscal: this.selectedRegimenFiscal
  //     });
  //   }
  // }

  openSnackBarError(message: string) {
    this._snackBar.open(message, 'cerrar', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
      duration: 5000,
    });
  }

  filterFutureDates = (date: Date | null): boolean => {
    // Disable past dates
    const currentDate = new Date();
    return !date || date <= currentDate;
  }
}


@Component({
  selector: 'dialog-component',
  template: `<span mat-dialog-title>Agregar artículos ordenCompra </span>
            <mat-dialog-content class="mat-typography">
              <!-- <app-orden-compra-articulo [ordenCompraArticulosModel]="ordenCompraArticulosModel" [ordenCompraArticuloModel]="ordenCompraArticuloModel" [proveedorId]="proveedorId" [isDespachar]="isDespachar" (cancel)="onCancelar()" (add)="onAgregarArticulo($event)" #appOrdenCompraArticuloComponent></app-orden-compra-articulo> -->
            </mat-dialog-content>`,
  styles: [
  ]
})
export class ArticuloOrdenCompraModalComponent {
  @ViewChild('appOrdenCompraArticuloComponent') appOrdenCompraArticuloComponent: any;
  ordenCompraArticuloModel!: OrdenCompraArticuloModel;
  ordenCompraArticulosModel!: OrdenCompraArticuloModel[];
  proveedorId = 0;
  isDespachar = false;

  constructor(
    public dialogRef: MatDialogRef<ArticuloOrdenCompraModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;

    if (Object.keys(data).length > 0) {
      if (data.articulo != undefined) {
        this.ordenCompraArticuloModel = data.articulo;
      }
      if (data.articulos != undefined) {
        this.ordenCompraArticulosModel = data.articulos;
      }
      if (data.proveedorId != undefined) {
        this.proveedorId = data.proveedorId;
      }
      if (data.isDespachar != undefined) {
        this.isDespachar = data.isDespachar;
      }
    }

  }

  onCancelar() {
    try {
      this.dialogRef.close();
    } catch (error) {
      console.error('An error occurred in onAgregarArticulo:', error);
    }
  }

  onAgregarArticulo(ordenCompraArticuloModel: OrdenCompraArticuloModel) {
    try {
      this.dialogRef.close(ordenCompraArticuloModel);
    } catch (error) {
      console.error('An error occurred in onAgregarArticulo:', error);
    }
  }
}



