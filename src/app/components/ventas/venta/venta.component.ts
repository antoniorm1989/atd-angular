import { Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { MessageComponent } from 'src/app/components/genericos/snack-message.component';
import { CatalogoClienteModel } from 'src/app/models/catalogo-cliente.model';
import { CatalogoFormaPagoModel, CatalogoObjetoImpuestoModel, CatalogoRegimenFiscalModel, CatalogoUsoCfdiModel } from 'src/app/models/catalogos.model';
import { User } from 'src/app/models/user';
import { VentaArticuloModel, VentaModel } from 'src/app/models/ventas.model';
import { CatalogoClientesService } from 'src/app/services/catalogo-cliente.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { UserService } from 'src/app/services/user.service';
import { VentaService } from 'src/app/services/ventas.service';
import { environment } from 'src/environments/environment';
import { DialogSuccessComponent } from '../../genericos/dialogSuccess.component';
import { DialogErrorComponent } from '../../genericos/dialogError.component';

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
  submitted = false;
  id = 0;

  clientes: CatalogoClienteModel[] = [];
  selectedCliente!: CatalogoClienteModel;
  filteredClientes!: Observable<CatalogoClienteModel[]>;

  vendedores: User[] = [];
  filteredVendedores!: Observable<User[]>;

  usoCfdiList: CatalogoUsoCfdiModel[] = [];
  selectedUsoCfdi!: CatalogoUsoCfdiModel;

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
  displayedColumns: string[] = ['numero_parte', 'descripcion', 'total', 'backorder', 'almacen', 'precio_unitario', 'descuento', 'importe', 'unidad_medida', 'importe_iva', 'importe_retencion', 'actions'];
  dataSourceArticulos = new MatTableDataSource<VentaArticuloModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  subTotal: number = 0;
  descuento: number = 0;
  iva: number = 0;
  retencion: number = 0;
  total: number = 0;

  editData: VentaModel | null = null;


  factura: any;

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private ventaService: VentaService,
    private router: Router,
    private catalogoClientesService: CatalogoClientesService,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private catalogosService: CatalogosService,
    private dialog: MatDialog) {

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
      tipo_cambio: 0,
      // Articulos
      objeto_impuesto: [],
      translada_iva: false,
      translada_iva_porcentaje: "0",
      retiene_iva: false,
      retiene_iva_porcentaje: "0",
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
                  translada_iva: venta.translada_iva,
                  translada_iva_porcentaje: venta.translada_iva_porcentaje?.toString(),
                  retiene_iva: venta.retiene_iva,
                  retiene_iva_porcentaje: venta.retiene_iva_porcentaje?.toString(),
                });

                this.dataSourceArticulos.data = venta.articulos || [];
                this.hasRecords = this.dataSourceArticulos.data.length > 0;

                this.calcularTotales();

                this.loadSelectData();

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

    this.form.controls['translada_iva'].valueChanges.subscribe((newValue) => {
      this.calcularTotales();
    });
    this.form.controls['translada_iva_porcentaje'].valueChanges.subscribe((newValue) => {
      this.calcularTotales();
    });
    this.form.controls['retiene_iva'].valueChanges.subscribe((newValue) => {
      this.calcularTotales();
    });
    this.form.controls['retiene_iva_porcentaje'].valueChanges.subscribe((newValue) => {
      this.calcularTotales();
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

    let venta = new VentaModel();
    // Datos generales
    venta.id = this.id;
    venta.fecha_compra_cliente = this.f['fecha_compra_cliente'].value;
    venta.cliente = this.f['cliente'].value;
    if (venta.cliente) {
      venta.cliente.regimen_fiscal = this.f['regimen_fiscal'].value;
    }
    venta.vendedor = this.vendedores.find(x => (x.name + ' ' + x.lastname) == this.f['vendedor'].value);
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
    venta.translada_iva = this.f['translada_iva'].value;
    venta.translada_iva_porcentaje = parseFloat(this.f['translada_iva_porcentaje'].value);
    venta.retiene_iva = this.f['retiene_iva'].value;
    venta.retiene_iva_porcentaje = parseFloat(this.f['retiene_iva_porcentaje'].value);
    venta.articulos = this.dataSourceArticulos.data;

    this.previewFactura(venta);
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

  openDialogError(comment: string): void {
    const dialogRef = this.dialog.open(DialogErrorComponent, {
      width: '710px',
      data: { title: '¡ Error !', content: comment }
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
            this.form.patchValue({ vendedor: this.vendedores.find(x => x.id == this.editData?.vendedor?.id)?.name + ' ' + this.vendedores.find(x => x.id == this.editData?.vendedor?.id)?.lastname });
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

  openArticuloVentaModalComponent() {
    const dialogRef = this.dialog.open(ArticuloVentaModalComponent, {
      height: '850px',
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
      height: '850px',
      data: {
        articulo: ventaArticuloModel,
        clienteId: this.f['cliente'].value ? this.f['cliente'].value.id : 0
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
      height: '700px',
      data: {
        articulo: ventaArticuloModel,
        isDespachar: true
      }
    });

    dialogRef.afterClosed().subscribe(ventaArticuloModel => {
      //this.router.navigate(['ventas']);
    });
  }

  calcularTotales() {
    this.calcularSubTotal();
    this.calcularDescuento();
    this.calcularIva();
    this.calcularRetencion();
    this.calcularTotal();
  }

  calcularSubTotal() {
    this.subTotal = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      this.subTotal += (articulo.precio_venta ?? 0) * (articulo.cantidad ?? 0);
    });
  }

  calcularDescuento() {
    this.descuento = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      this.descuento += articulo.descuento ?? 0;
    });
  }

  calcularIva() {
    this.iva = 0;
    if (this.f['translada_iva'].value == true)
      this.dataSourceArticulos.data.forEach(articulo => {
        this.iva += ((articulo.precio_venta ?? 0) * (articulo.cantidad ?? 0)) * this.f['translada_iva_porcentaje'].value;
      });
  }

  calcularRetencion() {
    this.retencion = 0;
    if (this.f['retiene_iva'].value == true)
      this.dataSourceArticulos.data.forEach(articulo => {
        this.retencion += ((articulo.precio_venta ?? 0) * (articulo.cantidad ?? 0)) * this.f['retiene_iva_porcentaje'].value;
      });
  }

  calcularTotal() {
    this.total = this.subTotal - this.descuento + this.iva - this.retencion;
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
        this.ventaService.create(venta).subscribe({
          next: (data) => {
            this.openDialogSuccess(`Se ha creado con éxito la venta #${data.id},  podrás visualizarlo desde tu listado ventas.`)
            this.router.navigate(['ventas']);
          },
          error: (e) => {
            this.openDialogError(`Hubo un error al crear la factura: ${e.error.detalles}`)
            console.log(e);
          }
        });
      }
    });
  }

  cancelarFactura() {
    const dialogRef = this.dialog.open(CancelarFacturaModalComponent, {
      height: '500px',
      width: '800px',
      data: {
        ventaId: this.id,
        venta: this.editData
      }
    });

    dialogRef.afterClosed().subscribe(ventaArticuloModel => {

    });
  }

  descargarFactura() {
    if (this.editData?.factura_cfdi_uid == undefined || this.editData?.factura_cfdi_uid == "") {
      this.openSnackBarError('No se ha generado la factura aún.');
    } else {
      this.ventaService.descargarFactura(this.editData?.factura_cfdi_uid).subscribe({
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


  timbrarVenta() {
    this.ventaService.timbrar(this.id).subscribe({
      next: (data) => {
        this.factura = data;
        this.openDialogSuccess(`Se ha timbrado con éxito la venta #${this.id}, podrás visualizarlo desde tu listado ventas.`)
        //this.router.navigate(['ventas']);
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  capitalizeWords(str: string): string {
    return str
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

@Component({
  selector: 'dialog-component',
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


@Component({
  selector: 'dialog-component-cancelar-factura',
  template: `<span mat-dialog-title>Cancelar Factura</span>
            <mat-dialog-content class="mat-typography">
              <app-cancelar-factura [ventaId]="ventaId" (regresar)="onRegresar()" (cancelar)="onCancelar()" #appCancelarFacturaComponent [venta]="venta"></app-cancelar-factura>
            </mat-dialog-content>`,
  styles: [
  ]
})
export class CancelarFacturaModalComponent {
  @ViewChild('appCancelarFacturaComponent') appCancelarFacturaComponent: any;
  ventaId!: number;
  venta!: VentaModel;

  constructor(
    public dialogRef: MatDialogRef<PreviewFacturaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;

    if (Object.keys(data).length > 0) {
      if (data.ventaId != undefined) {
        this.ventaId = data.ventaId;
      }
      if (data.venta != undefined) {
        this.venta = data.venta;
      }
    }

  }

  onRegresar() {
    try {
      this.dialogRef.close();
    } catch (error) {
      console.error('An error occurred in regesar:', error);
    }
  }

  onCancelar() {
    try {
      this.dialogRef.close();
    } catch (error) {
      console.error('An error occurred in cancelar factura:', error);
    }
  }
}



