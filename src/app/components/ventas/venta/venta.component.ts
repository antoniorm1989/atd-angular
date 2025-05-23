import { Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { CatalogoClienteModel } from 'src/app/models/catalogo-cliente.model';
import { CatalogoFormaPagoModel, CatalogoObjetoImpuestoModel, CatalogoRegimenFiscalModel, CatalogoUsoCfdiModel, CatalogoMotivoCancelacionModel } from 'src/app/models/catalogos.model';
import { User } from 'src/app/models/user';
import { VentaArticuloModel, VentaModel, VentaDocumentoModel, FacturaStatus } from 'src/app/models/ventas.model';
import { CatalogoClientesService } from 'src/app/services/catalogo-cliente.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { UserService } from 'src/app/services/user.service';
import { VentaService } from 'src/app/services/ventas.service';
import { environment } from 'src/environments/environment';
import { DialogSuccessComponent } from '../../genericos/dialogSuccess.component';
import { DialogErrorComponent } from '../../genericos/dialogError.component';
import { DialogWarningComponent } from '../../genericos/dialogWarning.component';
import { LoadingService } from 'src/app/components/genericos/loading/loading.service';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class VentaComponent {

  action: string = 'view';
  title: string = '';
  form: FormGroup;
  formCancelacion: FormGroup;

  submitted = false;
  submittedCancelacion = false;
  id = 0;

  clientes: CatalogoClienteModel[] = [];
  selectedCliente!: CatalogoClienteModel;
  filteredClientes!: Observable<CatalogoClienteModel[]>;

  vendedores: User[] = [];
  filteredVendedores!: Observable<User[]>;

  usoCfdiList: CatalogoUsoCfdiModel[] = [];
  selectedUsoCfdi!: CatalogoUsoCfdiModel;

  motivoCancelacionList: CatalogoMotivoCancelacionModel[] = [{
    clave: '01',
    motivo: 'Comprobante emitido con errores con relación'
  }, {
    clave: '02',
    motivo: 'Comprobante emitido con errores sin relación'
  }, {
    clave: '03',
    motivo: 'No se llevó; a cabo la operación'
  }, {
    clave: '04',
    motivo: 'Operación nominativa relacionada en la factura global'
  }];
  selectedMotivoCancelacion!: CatalogoMotivoCancelacionModel;


  regimenesFiscales: CatalogoRegimenFiscalModel[] = [];
  selectedRegimenFiscal!: CatalogoRegimenFiscalModel;

  formaPagoList: CatalogoFormaPagoModel[] = [];
  selectedFormaPago!: CatalogoFormaPagoModel;

  metodoPagoList: CatalogoFormaPagoModel[] = [];
  selectedMetodoPago!: CatalogoFormaPagoModel;

  objetoImpuestoList: CatalogoObjetoImpuestoModel[] = [];
  selectedObjetoImpuesto!: CatalogoObjetoImpuestoModel;

  selectedCondicionPago = "contado";

  hasRecords = false;
  displayedColumns: string[] = ['almacen', 'numero_parte', 'descripcion', 'unidad_medida', 'backorder', 'total', 'totalConDescuento', 'importe_iva', 'importe_retencion', 'importe_total', 'actions'];

  displayedColumnsCancelacion: string[] = ['numero_parte', 'descripcion', 'total', 'backorder', 'almacen'];
  dataSourceArticulos = new MatTableDataSource<VentaArticuloModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  hasRecordsDocumentos = false;
  displayedColumnsDocumentos: string[] = ['nombre', 'fecha_creacion', 'acciones'];
  dataSourceDocumentos = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginatorDocumentos!: MatPaginator;

  subTotal: number = 0;
  iva: number = 0;
  retencion: number = 0;
  total: number = 0;

  editData: VentaModel | null = null;


  factura: any;

  comentario: string = "";
  originalComentario: string = "";
  comentarioHasChanged: boolean = false;

  facturaEstatusList: FacturaStatus[] | undefined;
  ventaEstatusList: FacturaStatus[] | undefined;

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private ventaService: VentaService,
    private router: Router,
    private catalogoClientesService: CatalogoClientesService,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private catalogosService: CatalogosService,
    private dialog: MatDialog,
    private loadingService: LoadingService) {

    let tipoCambioDefault = this.getTipoCambioDefault();

    this.form = this.formBuilder.group({
      // Datos generales
      fecha_compra_cliente: new Date(),
      vendedor: null,
      usoCfdi: [null, Validators.required],
      cliente: [null, Validators.required],
      nombre_fiscal: [''],
      regimen_fiscal: [''],
      comentarios: "",
      // Forma pago
      condicion_pago: ['contado'],
      tiene_dias_credito: { value: false, disabled: true },
      cantidad_dias_credito: { value: 0, disabled: true },
      moneda: ['MXN'],
      forma_pago: [],
      metodo_pago: [],
      tipo_cambio: tipoCambioDefault,
      // Articulos
      objeto_impuesto: [],
      translada_iva_porcentaje: "0",
      retiene_iva_porcentaje: "0"
    });

    this.formCancelacion = this.formBuilder.group({
      fecha_cancelacion: [null, Validators.required],
      motivo_cancelacion: [null, Validators.required],
      folioSustituto: ['']
    });

    this.formCancelacion.get('motivo_cancelacion')?.valueChanges.subscribe(value => {
      const facturaControl = this.formCancelacion.get('folioSustituto');

      if (value === '01') {
        facturaControl?.setValidators(Validators.required);
      } else {
        facturaControl?.clearValidators();
      }
      facturaControl?.updateValueAndValidity();
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url.includes('/ventas/detail')) {

        this.route.params.subscribe(params => {
          this.id = params['ventaId'];
          if (this.id != undefined) {
            this.ventaService.getById(this.id).subscribe({
              next: (data) => {

                var venta = data;
                this.editData = venta;

                this.comentario = venta.comentarios || "";
                this.originalComentario = this.comentario;

                this.form.patchValue({
                  // Datos generales
                  fecha_compra_cliente: venta.fecha_compra_cliente,
                  usoCfdi: venta.uso_cfdi,
                  comentarios: venta.comentarios,
                  nombre_fiscal: venta.cliente?.nombre_fiscal,
                  regimen_fiscal: venta.cliente?.regimen_fiscal,
                  // Forma pago
                  condicion_pago: venta.condicion_pago,
                  tiene_dias_credito: venta.tiene_dias_credito,
                  cantidad_dias_credito: venta.cantidad_dias_credito,
                  moneda: venta.moneda,
                  forma_pago: venta.forma_pago,
                  metodo_pago: venta.metodo_pago,
                  tipo_cambio: venta.tipo_cambio,
                  // Articulos
                  objeto_impuesto: venta.objeto_impuesto,
                  translada_iva_porcentaje: venta.translada_iva_porcentaje?.toString(),
                  retiene_iva_porcentaje: venta.retiene_iva_porcentaje?.toString(),
                });

                this.dataSourceArticulos.data = venta.articulos || [];
                this.hasRecords = this.dataSourceArticulos.data.length > 0;

                this.calcularTotales();

                this.loadSelectData();

                this.obtenerDocumentos();

                this.obtenerFacturasEstatus();

                this.obtenerVentasEstatus();

                this.route.queryParams.subscribe(params => {
                  switch (params['action']) {
                    case undefined:
                      this.action = 'view';
                      this.title = 'Consultar factura';
                      //this.form.disable();
                      break;
                    case 'edit':
                      this.action = 'edit';
                      this.title = 'Editar factura';
                      break;
                  }
                });
              },
              error: (e) => {
              }
            });
          } else {
            this.action = 'new';
            this.title = 'Crear factura';
            this.loadSelectData();
          }
        });
      }
    });

    this.form.controls['translada_iva_porcentaje'].valueChanges.subscribe((newValue) => {
      this.calcularTotales();
    });
    this.form.controls['retiene_iva_porcentaje'].valueChanges.subscribe((newValue) => {
      this.calcularTotales();
    });
    this.form.controls['moneda'].valueChanges.subscribe((newValue) => {
      this.calcularTotales();
    });
    this.form.controls['tipo_cambio'].valueChanges.subscribe((newValue) => {
      this.calcularTotales();
    });
  }

  get f() { return this.form!.controls; }

  get fCancelacion() { return this.formCancelacion!.controls; }

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

    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
    let user = new User();
    user.id = userData.id;

    let venta = new VentaModel();
    // Datos generales
    venta.id = this.id;
    venta.fecha_compra_cliente = this.f['fecha_compra_cliente'].value;
    venta.cliente = this.f['cliente'].value;
    if (venta.cliente) {
      venta.cliente.regimen_fiscal = this.f['regimen_fiscal'].value;
    }
    venta.vendedor = this.vendedores.find(x => (x.name + ' ' + x.last_name) == this.f['vendedor'].value);
    venta.uso_cfdi = this.f['usoCfdi'].value;
    venta.comentarios = this.f['comentarios'].value;
    venta.responsable = user;
    venta.uso_cfdi = this.f['usoCfdi'].value;
    // forma pago
    venta.condicion_pago = this.f['condicion_pago'].value;
    venta.tiene_dias_credito = this.f['tiene_dias_credito'].value;
    venta.cantidad_dias_credito = this.f['cantidad_dias_credito'].value;
    venta.moneda = this.f['moneda'].value;
    venta.tipo_cambio = this.f['tipo_cambio'].value;
    venta.forma_pago = this.f['forma_pago'].value;
    venta.metodo_pago = this.f['metodo_pago'].value;
    // Articulos
    venta.objeto_impuesto = this.f['objeto_impuesto'].value;
    venta.translada_iva_porcentaje = parseFloat(this.f['translada_iva_porcentaje'].value);
    venta.retiene_iva_porcentaje = parseFloat(this.f['retiene_iva_porcentaje'].value);
    venta.articulos = this.dataSourceArticulos.data;

    this.previewFactura(venta);
  }

  checkChanges() {
    this.comentarioHasChanged = this.comentario !== this.originalComentario;
  }

  onUpdateComentario() {
    this.ventaService.updateComentario(this.id, this.comentario).subscribe({
      next: () => {
        this.openSnackBarSuccess('Comentario actualizado correctamente.');
        this.originalComentario = this.comentario;
        this.comentarioHasChanged = false;
      },
      error: (e) => {
        this.openSnackBarError('Hubo un error al actualizar el comentario.');
      }
    });
  }

  subirDocumento(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.ventaService.uploadFile(this.id, file).subscribe({
        next: () => {
          this.openSnackBarSuccess('Archivo subido correctamente.');
          this.obtenerDocumentos();
        }
      });
    }
  }

  openDialogSuccess(comment: string, callbackFunction: () => void = () => { }): void {
    const dialogRef = this.dialog.open(DialogSuccessComponent, {
      width: '710px',
      data: { title: '¡ En hora buena !', content: comment }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
      callbackFunction();
    });
  }

  openDialogError(comment: string): void {
    const dialogRef = this.dialog.open(DialogErrorComponent, {
      width: '710px',
      data: { title: '¡ Error !', content: comment }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  onSubmitCancelacion() {
    this.submittedCancelacion = true;

    if (this.formCancelacion!.invalid)
      return;

    this.openDialogWarning(`Cuando se cancela una factura, todos los artículos que ya se habían marcado como salida volverán a entrar y estarán disponibles en stock. Esta acción no podrá ser reversible.`)
  }

  openDialogWarning(comment: string): void {
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      width: '710px',
      data: { title: '¡ Espera !', content: comment }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'ok') {
        this.loadingService.show();
        this.ventaService.cancelarVenta(this.id, this.fCancelacion['fecha_cancelacion'].value, this.fCancelacion['motivo_cancelacion'].value, this.fCancelacion['folioSustituto'].value, this.editData?.factura_cfdi_uid || "").subscribe({
          next: () => {
            this.loadingService.hide();
            this.openSnackBarSuccess('Venta cancelada correctamente.');
            this.router.navigate(['ventas']);
          },
          error: (e) => {
            this.loadingService.hide();
            this.openDialogError(`Hubo un error al crear la factura: ${e.error.error}`)
          }
        });
      }
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  formatDate(dateInput: string | Date | undefined): string {
    if (!dateInput) return "N/A"; // Handle undefined or empty values

    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

    if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid date cases

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${month}/${day}/${year}`;
  }

  formatTime(dateInput: string | Date | undefined): string {
    if (!dateInput) return "N/A"; // Handle undefined or empty values

    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

    if (isNaN(date.getTime())) return "Invalid Time"; // Handle invalid date cases

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`; // e.g., 12:44
  }

  getUrlPhoto(photo: string): string {
    return `${environment.apiUrl}/images/users/${photo}`;
  }

  getUserName(name: string, last_name: string): string {
    return name[0].toUpperCase() + last_name[0].toUpperCase();
  }

  makeEditMode() {
    this.action = 'edit';
    this.title = 'Editar articulo';
    this.form.enable();
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
    this.catalogoClientesService.getAll().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.clientes = data;
          this.filteredClientes = this.form.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || '')),
          );
          if (this.editData != undefined)
            this.form.patchValue({ cliente: this.clientes.find(x => x.id == this.editData?.cliente?.id) });
        }
      },
      error: (e) => {
      }
    });

    this.userService.getAll().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.vendedores = data;
          this.filteredVendedores = this.form.valueChanges.pipe(
            startWith(''),
            map(value => this._filterVendedores(value || '')),
          );
          if (this.editData != undefined)
            this.form.patchValue({ vendedor: this.vendedores.find(x => x.id == this.editData?.vendedor?.id)?.name + ' ' + this.vendedores.find(x => x.id == this.editData?.vendedor?.id)?.last_name });
        }
      },
      error: (e) => {
      }
    });

    this.catalogosService.getUsoCfdi().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.usoCfdiList = data;
          if (this.editData != undefined) {
            let selectedUsoCfdi = data.find(x => x.id == this.editData?.uso_cfdi?.id);
            if (selectedUsoCfdi != undefined)
              this.form.patchValue({ usoCfdi: selectedUsoCfdi });
          }
          else
            this.selectedUsoCfdi = data[0];
        }
      },
      error: (e) => {
      }
    });

    this.catalogosService.getRegimenensFiscales().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.regimenesFiscales = data;
          if (this.editData != undefined) {
            let selectedRegimenFiscal = data.find(x => x.id == this.editData?.cliente?.regimen_fiscal?.id);
            if (selectedRegimenFiscal != undefined)
              this.form.patchValue({ regimen_fiscal: selectedRegimenFiscal });
          }
          else
            this.selectedRegimenFiscal = data[0];
        }
      },
      error: (e) => {
        console.log(e);
      }
    });

    this.catalogosService.getMetodoPago().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.metodoPagoList = data;
          if (this.editData != undefined) {
            let selectedMetodoPago = data.find(x => x.id == this.editData?.metodo_pago?.id);
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

    this.catalogosService.getObjetoImpuesto().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.objetoImpuestoList = data;
          if (this.editData != undefined) {
            let selectedObjetoImpuesto = data.find(x => x.id == this.editData?.objeto_impuesto?.id);
            if (selectedObjetoImpuesto != undefined)
              this.form.patchValue({ objeto_impuesto: selectedObjetoImpuesto });
          }
          else
            this.selectedObjetoImpuesto = data[0];
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
            let selectedFormaPago = data.find(x => x.id == this.editData?.forma_pago?.id);
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

  private _filter(value: any): CatalogoClienteModel[] {
    let filterValue = "";
    if (value.cliente) {
      filterValue = value.cliente.cliente || value.cliente;
      filterValue = filterValue.toLowerCase();
    }
    return this.clientes.filter(option => option.cliente!.toLowerCase().includes(filterValue));
  }

  private _filterVendedores(value: any): User[] {
    let filterValue = "";
    if (value.vendedor) {
      filterValue = value.vendedor.name || value.vendedor;
      filterValue = filterValue.toLowerCase();
    }
    return this.vendedores.filter(option => option.name!.toLowerCase().includes(filterValue));
  }

  clearAutocompleteInput() {
    try {
      this.f['cliente'].reset();
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

  removeArticulo(articulo: VentaArticuloModel) {
    const indexToRemove = this.dataSourceArticulos.data.findIndex(item => item.almacen?.articulo?.id === articulo.almacen?.articulo?.id);
    if (indexToRemove !== -1) {
      this.dataSourceArticulos.data.splice(indexToRemove, 1);
      this.dataSourceArticulos._updateChangeSubscription();
    }

    if (this.dataSourceArticulos.data.length == 0)
      this.hasRecords = false;

    this.calcularTotales();
  }

  calcularImporteByArticuloIva(costo: number, cantidad: number): string {
    return this.formatearComoMoneda(((costo * cantidad)) * this.f['translada_iva_porcentaje'].value);
  }

  calcularImporteByArticuloRetencion(costo: number, cantidad: number): string {
    return this.formatearComoMoneda((costo * cantidad) * this.f['retiene_iva_porcentaje'].value);
  }

  calcularImporteTotalByArticulo(costo: number, cantidad: number): string {
    let total = 0;
    total += ((costo * cantidad)) * this.f['translada_iva_porcentaje'].value;
    total -= (costo * cantidad) * this.f['retiene_iva_porcentaje'].value;
    return this.formatearComoMoneda(total + (costo * cantidad));
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

  openArticuloVentaModalComponent() {
    const dialogRef = this.dialog.open(ArticuloVentaModalComponent, {
      height: '900px',
      width: '1100px',
      data: {
        articulos: this.dataSourceArticulos.data,
        clienteId: this.f['cliente'].value ? this.f['cliente'].value.id : 0
      },
    });

    dialogRef.afterClosed().subscribe(ventaArticuloModel => {
      if (ventaArticuloModel != undefined && ventaArticuloModel != "") {
        this.dataSourceArticulos.data.push(ventaArticuloModel);
        this.dataSourceArticulos._updateChangeSubscription();
        this.hasRecords = true;
        this.calcularTotales();
      }
    });
  }

  editArticuloVentaModalComponent(ventaArticuloModel: VentaArticuloModel) {
    ventaArticuloModel.ventaId = this.id;
    const dialogRef = this.dialog.open(ArticuloVentaModalComponent, {
      height: '900px',
      width: '1100px',
      data: {
        articulo: ventaArticuloModel,
        clienteId: 0 // voy a editar, buscar en todos los articulos por si selecciono articulos no relacionados al cliente
      }
    });

    dialogRef.afterClosed().subscribe(ventaArticuloModel => {
      if (ventaArticuloModel && ventaArticuloModel !== "") {
        const existingIndex = this.dataSourceArticulos.data.findIndex(item => item.almacen?.articulo?.id === ventaArticuloModel.almacen?.articulo?.id);
        if (existingIndex !== -1) {
          // Si existe un objeto con el mismo id, elimínalo
          this.dataSourceArticulos.data.splice(existingIndex, 1);
        }
        // Agrega el nuevo objeto
        this.dataSourceArticulos.data.push(ventaArticuloModel);
        this.dataSourceArticulos._updateChangeSubscription();
        this.hasRecords = true;
        this.calcularTotales();
      }
    });
  }

  despacharArticuloVentaModalComponent(ventaArticuloModel: VentaArticuloModel) {
    ventaArticuloModel.ventaId = this.id;
    const dialogRef = this.dialog.open(ArticuloVentaModalComponent, {
      height: '600px',
      data: {
        articulo: ventaArticuloModel,
        isDespachar: true
      }
    });

    dialogRef.afterClosed().subscribe(ventaArticuloModel => {
      if (ventaArticuloModel != undefined && ventaArticuloModel != "") {
        this.openDialogSuccess(`Se ha despachado el artículo con éxito.`, () => {
          document.location.reload();
        });
      }
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
      let totalConDescuento = this.obtenerTotalConDescuento(articulo);
      this.subTotal += (totalConDescuento) * (articulo.cantidad ?? 0);
    });
  }

  calcularIva() {
    this.iva = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      this.iva += ((this.obtenerTotalConDescuento(articulo) ?? 0) * (articulo.cantidad ?? 0)) * this.f['translada_iva_porcentaje'].value;
    });
  }

  calcularRetencion() {
    this.retencion = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      this.retencion += ((this.obtenerTotalConDescuento(articulo) ?? 0) * (articulo.cantidad ?? 0)) * this.f['retiene_iva_porcentaje'].value;
    });
  }

  calcularTotal() {
    this.total = this.subTotal + this.iva - this.retencion;
  }

  obtenerTotalConDescuento(articulo: VentaArticuloModel): number {
    let totalConDescuento = 0;
    if (this.f['moneda'].value == "MXN") {
      if (articulo.moneda_nombre == "MXN")
        totalConDescuento = articulo.totalConDescuento ?? 0;
      else if (articulo.moneda_nombre == "USD")
        totalConDescuento = (articulo.totalConDescuento ?? 0) * this.f['tipo_cambio'].value;
    }
    else if (this.f['moneda'].value == "USD") {
      if (articulo.moneda_nombre == "MXN")
        totalConDescuento = (articulo.totalConDescuento ?? 0) / this.f['tipo_cambio'].value;
      else if (articulo.moneda_nombre == "USD")
        totalConDescuento = (articulo.totalConDescuento ?? 0);
    }
    return totalConDescuento;
  }

  onClienteSelectionChange(event: any) {
    if (event.source._selected == true) {
      this.selectedCliente = event.source.value;

      let regimenFiscal = this.regimenesFiscales.find(x => x.id == this.selectedCliente.regimen_fiscal?.id);
      if (regimenFiscal != undefined)
        this.selectedRegimenFiscal = regimenFiscal;

      this.form.patchValue({
        nombre_fiscal: this.selectedCliente?.nombre_fiscal,
        regimen_fiscal: this.selectedRegimenFiscal
      });
    }
  }

  openSnackBarError(message: string) {
    this._snackBar.open(message, 'cerrar', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
      duration: 5000,
    });
  }

  openSnackBarSuccess(message: string) {
    this._snackBar.open(message, 'cerrar', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
      duration: 5000,
    });
  }

  filterFutureDates = (date: Date | null): boolean => {
    // Disable past dates
    const currentDate = new Date();
    return !date || date <= currentDate;
  }

  previewFactura(venta: VentaModel) {
    const dialogRef = this.dialog.open(PreviewFacturaModalComponent, {
      height: '900px',
      width: '1100px',
      data: {
        venta: venta
      }
    });

    dialogRef.afterClosed().subscribe(facturar => {
      if (facturar) {
        this.loadingService.show();

        // transformar antes de timbrar al tipo de cambio correcto
        venta.articulos = venta.articulos?.map(articulo => {
          articulo.precio_venta = this.obtenerTotalConDescuento(articulo);
          return articulo;
        });

        this.ventaService.create(venta).subscribe({
          next: (data) => {
            this.loadingService.hide();
            this.openDialogSuccess(`Se ha creado con éxito la venta #${data.id}, podrás visualizarlo desde tu listado ventas.`)
            this.router.navigate(['ventas']);
          },
          error: (e) => {
            this.loadingService.hide();
            this.openDialogError(`Hubo un error al crear la factura: ${e.error.detalles}`)
            this.router.navigate(['ventas']);
            console.log(e);
          }
        });
      }
    });
  }

  descargarFacturaPDF() {
    if (this.editData?.factura_cfdi_uid == undefined || this.editData?.factura_cfdi_uid == "") {
      this.openSnackBarError('No se ha generado la factura aún.');
    } else {
      this.ventaService.descargarFactura(this.editData?.factura_cfdi_uid, 'pdf').subscribe({
        next: (data) => {
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          // Descarga el archivo en lugar de abrirlo
          const link = document.createElement('a');
          link.href = url;
          link.download = `cfdi_${this.id}.pdf`;
          link.click();

          window.URL.revokeObjectURL(url);
        },
        error: (e) => {
          console.log(e);
        }
      });
    }
  }

  descargarFacturaXML() {
    if (this.editData?.factura_cfdi_uid == undefined || this.editData?.factura_cfdi_uid == "") {
      this.openSnackBarError('No se ha generado la factura aún.');
    } else {
      this.ventaService.descargarFactura(this.editData?.factura_cfdi_uid, 'xml').subscribe({
        next: (data) => {
          const blob = new Blob([data], { type: 'application/xml' });
          const url = window.URL.createObjectURL(blob);

          // Descarga el archivo en lugar de abrirlo
          const link = document.createElement('a');
          link.href = url;
          link.download = `cfdi_${this.id}.xml`;
          link.click();

          window.URL.revokeObjectURL(url);
        },
        error: (e) => {
          console.log(e);
        }
      });
    }
  }

  capitalizeWords(str: string): string {
    return str
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  descargarDocumento(documento: VentaDocumentoModel) {
    if (documento.id) {
      this.ventaService.descargarDocumento(documento.id).subscribe({
        next: (data) => {
          const blob = new Blob([data], { type: documento.tipo });
          const url = window.URL.createObjectURL(blob);

          // Crear enlace de descarga
          const link = document.createElement('a');
          link.href = url;
          link.download = documento.nombre || `documento_${documento.id}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Liberar URL
          window.URL.revokeObjectURL(url);

          this.openSnackBarSuccess('Descarga exitosa.');
        },
        error: (e) => {
          console.error('Error al descargar el documento:', e);
        }
      });
    }
    else {
      this.openSnackBarError('No se ha generado el documento aún.');
    }
  }

  eliminarDocumento(documento: VentaDocumentoModel) {
    if (documento.id) {
      this.ventaService.eliminarDocumento(documento.id).subscribe({
        next: () => {
          this.dataSourceDocumentos.data = this.dataSourceDocumentos.data.filter(x => x.id !== documento.id);
          this.dataSourceDocumentos._updateChangeSubscription();
          this.hasRecordsDocumentos = this.dataSourceDocumentos.data.length > 0;

          this.openSnackBarSuccess('Documento eliminado correctamente.');
        },
        error: (e) => {
          console.error('Error al eliminar el documento:', e);
        }
      });
    } else {
      this.openSnackBarError('No se ha generado el documento aún.');
    }
  }

  obtenerDocumentos() {
    this.ventaService.getDocumentos(this.id).subscribe({
      next: (data) => {
        this.dataSourceDocumentos.data = data;
        this.dataSourceDocumentos._updateChangeSubscription();
        this.hasRecordsDocumentos = this.dataSourceDocumentos.data.length > 0;
      },
      error: (e) => {
        console.error('Error al obtener los documentos:', e);
      }
    });
  }

  obtenerFacturasEstatus() {
    this.ventaService.obtenerFacturasEstatus(this.id).subscribe({
      next: (data) => {
        this.facturaEstatusList = data;
      },
      error: (e) => {
        console.error('Error al obtener los estatus de las facturas:', e);
      }
    });
  }

  obtenerVentasEstatus() {
    this.ventaService.obtenerVentaEstatus(this.id).subscribe({
      next: (data) => {
        this.ventaEstatusList = data;
      },
      error: (e) => {
        console.error('Error al obtener los estatus de las ventas:', e);
      }
    });
  }

  isFacturada(): boolean {
    if (this.editData && this.editData.factura_estatus && (this.editData.factura_estatus.estatus === 'Facturada'))
      return true;
    return false;
  }

  isCancelada(): boolean {
    if (this.editData && this.editData.factura_estatus && (this.editData.factura_estatus.estatus === 'Cancelada' || this.editData.factura_estatus.estatus === 'Pre-Cancelada'))
      return true;
    return false;
  }

  formatNumber(input: number): string {
    return input.toString().padStart(4, '0');
  }

  displayClienteFn(cliente: any): string {
    return cliente && cliente.cliente ? cliente.cliente : '';
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

}

@Component({
  selector: 'dialog-component-agregar-articulo-venta',
  template: `<span mat-dialog-title>Agregar artículos venta </span>
            <mat-dialog-content class="mat-typography">
              <app-venta-articulo [ventaArticulosModel]="ventaArticulosModel" [ventaArticuloModel]="ventaArticuloModel" [clienteId]="clienteId" [isDespachar]="isDespachar" (cancel)="onCancelar()" (add)="onAgregarArticulo($event)" #appVentaArticuloComponent></app-venta-articulo>
            </mat-dialog-content>`,
  styles: [
  ]
})
export class ArticuloVentaModalComponent {
  @ViewChild('appVentaArticuloComponent') appVentaArticuloComponent: any;
  ventaArticuloModel!: VentaArticuloModel;
  ventaArticulosModel!: VentaArticuloModel[];
  clienteId = 0;
  isDespachar = false;

  constructor(
    public dialogRef: MatDialogRef<ArticuloVentaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;

    if (Object.keys(data).length > 0) {
      if (data.articulo != undefined) {
        this.ventaArticuloModel = data.articulo;
      }
      if (data.articulos != undefined) {
        this.ventaArticulosModel = data.articulos;
      }
      if (data.clienteId != undefined) {
        this.clienteId = data.clienteId;
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

  onAgregarArticulo(ventaArticuloModel: VentaArticuloModel) {
    try {
      this.dialogRef.close(ventaArticuloModel);
    } catch (error) {
      console.error('An error occurred in onAgregarArticulo:', error);
    }
  }
}


@Component({
  selector: 'dialog-component-preview-factura',
  template: `<span mat-dialog-title>Confirmación de dato factura</span>
            <mat-dialog-content class="mat-typography">
              <app-preview-factura [venta]="venta" (cancel)="onCancelar()" (timbrar)="onTimbrar()" #appPreviewFacturaComponent></app-preview-factura>
            </mat-dialog-content>`,
  styles: [
  ]
})
export class PreviewFacturaModalComponent {
  @ViewChild('appVentaArticuloComponent') appPreviewFacturaComponent: any;
  venta!: VentaModel;

  constructor(
    public dialogRef: MatDialogRef<PreviewFacturaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;

    if (Object.keys(data).length > 0) {
      if (data.venta != undefined) {
        this.venta = data.venta;
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

  onTimbrar() {
    try {
      this.dialogRef.close(true);
    } catch (error) {
      console.error('An error occurred in onAgregarArticulo:', error);
    }
  }
}