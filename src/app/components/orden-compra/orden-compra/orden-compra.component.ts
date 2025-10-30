import { Component, Inject, ViewChild } from "@angular/core";
import { LoadingService } from "../../genericos/loading/loading.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { OrdenCompraService } from "src/app/services/orden-compra.service";
import { CatalogoProveedoresService } from "src/app/services/catalogo-proveedor.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CatalogosService } from "src/app/services/catalogos.service";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { OrdenCompraArticuloModel, OrdenCompraModel } from "src/app/models/orden-compra.model";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { CatalogoFormaPagoModel, CatalogoMonedaModel } from "src/app/models/catalogos.model";
import { CatalogoProveedorModel } from "src/app/models/catalogo-proveedor.model";
import { map, Observable, startWith } from "rxjs";
import { environment } from "src/environments/environment";
import { OrdenCompraArticuloComponent } from "./articulo/orden-compra-articulo.component";
import { User } from "src/app/models/user";

@Component({
  selector: 'app-orden-compra',
  templateUrl: './orden-compra.component.html',
  styleUrls: ['./orden-compra.component.css']
})
export class OrdenCompraComponent {

  ordenCompraModel: OrdenCompraModel = new OrdenCompraModel();
  action: string = 'view';
  title: string = '';
  form!: FormGroup;
  submitted = false;
  id = 0;

  comentario: string = "";
  originalComentario: string = "";
  comentarioHasChanged: boolean = false;

  hasRecords = false;
  displayedColumns: string[] = ['numero_parte', 'descripcion', 'cantidad', 'almacen', 'precio_compra', 'importe', 'actions'];
  dataSourceArticulos = new MatTableDataSource<OrdenCompraArticuloModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  monedas: CatalogoMonedaModel[] = [];

  subTotal: number = 0;
  iva: number = 0;
  retencion: number = 0;
  total: number = 0;

  formaPagoList: CatalogoFormaPagoModel[] = [];
  selectedFormaPago!: CatalogoFormaPagoModel;

  metodoPagoList: CatalogoFormaPagoModel[] = [];
  selectedMetodoPago!: CatalogoFormaPagoModel;

  proveedores: CatalogoProveedorModel[] = [];
  selectedProveedor: CatalogoProveedorModel | null = null;
  filteredProveedores!: Observable<CatalogoProveedorModel[]>;

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private ordenCompraService: OrdenCompraService,
    private router: Router,
    private catalogoProveedoresService: CatalogoProveedoresService,
    private _snackBar: MatSnackBar,
    private catalogosService: CatalogosService,
    private dialog: MatDialog,
    private loadingService: LoadingService) { }

  get isReadOnly() {
    return this.action == 'view';
  }

  get f() { return this.form!.controls; }

  ngOnInit() {

    let tipoCambioDefault = this.getTipoCambioDefault();

    this.form = this.formBuilder.group({
      // Datos generales
      proveedor: [null, Validators.required],
      folio_interno: ['', [Validators.pattern(/^[0-9]+$/)]], // Solo números enteros
      venta_id: ['', [Validators.pattern(/^[0-9]+$/)]], // Solo números enteros
      fecha_registro: [new Date(), Validators.required],
      // Forma pago
      condicion_pago: ['contado', Validators.required],
      tiene_dias_credito: [{ value: false, disabled: true }],
      cantidad_dias_credito: [{ value: 0, disabled: true }],
      moneda: [null, Validators.required],
      forma_pago: [null, Validators.required],
      metodo_pago: [null, Validators.required],
      tipo_cambio: [tipoCambioDefault, [Validators.required, Validators.min(0.01)]],
      // Articulos
      translada_iva: ['0', Validators.required],
      retiene_iva: ['0', Validators.required],
      comentarios: [''],
    });

    this.route.params.subscribe(params => {
      this.id = params['ordenCompraId'];
      if (this.id != undefined) {
        this.ordenCompraService.getById(this.id).subscribe({
          next: (data) => {
            this.ordenCompraModel = data;

            this.comentario = this.ordenCompraModel.comentarios || "";
            this.originalComentario = this.comentario;

            this.form.patchValue({
              // Datos generales
              proveedor: this.ordenCompraModel.proveedor,
              folio_interno: this.ordenCompraModel.folio_interno,
              venta_id: this.ordenCompraModel.venta_id,
              fecha_registro: this.ordenCompraModel.created_at,
              comentarios: this.ordenCompraModel.comentarios,
              // Forma pago
              condicion_pago: this.ordenCompraModel.condicion_pago,
              tiene_dias_credito: this.ordenCompraModel.tiene_dias_credito,
              cantidad_dias_credito: this.ordenCompraModel.cantidad_dias_credito,
              moneda: this.ordenCompraModel.moneda,
              forma_pago: this.ordenCompraModel.forma_pago,
              metodo_pago: this.ordenCompraModel.metodo_pago,
              tipo_cambio: this.ordenCompraModel.tipo_cambio,
              // Articulos
              translada_iva: this.ordenCompraModel.translada_iva?.toString(),
              retiene_iva: this.ordenCompraModel.retiene_iva?.toString()
            });

            this.dataSourceArticulos.data = this.ordenCompraModel.articulos || [];
            this.hasRecords = this.dataSourceArticulos.data.length > 0;

            this.calcularTotales();
            this.loadSelectData();

            this.route.queryParams.subscribe(params => {
              switch (params['action']) {
                case undefined:
                  this.action = 'view';
                  this.title = 'Ver orden de compra';
                  break;
                case 'edit':
                  this.action = 'edit';
                  this.title = 'Editar orden de compra';
                  break;
              }
            });
          },
          error: (e) => {
          }
        });
      } else {
        // Nueva venta
        this.action = 'new';
        this.title = 'Nueva orden de compra';
        this.loadSelectData();
      }

      this.catalogosService.getMonedas().subscribe({
        next: (data) => {
          this.monedas = data;
          this.form.controls['moneda'].setValue(this.monedas[0]);
        },
        error: (e) => {
          console.log(`Hubo un error al cargar el catalogo de monedas: ${e.error.error}`);
        }
      });
    });

    this.form.get('proveedor')?.valueChanges.subscribe(value => {
      if (value && typeof value === 'object') {
        this.selectedProveedor = value;
      } else if (typeof value === 'string') {
        const proveedor = this.proveedores.find(p => p.proveedor === value);
        this.selectedProveedor = proveedor || null;
      } else {
        this.selectedProveedor = null;
      }
    });

    this.form.controls['translada_iva'].valueChanges.subscribe((newValue) => {
      this.calcularTotales();
    });
    this.form.controls['retiene_iva'].valueChanges.subscribe((newValue) => {
      this.calcularTotales();
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
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
      this.subTotal += (articulo.precio_compra ?? 0) * (articulo.cantidad ?? 0);
    });
  }

  calcularIva() {
    this.iva = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      this.iva += ((articulo.precio_compra ?? 0) * (articulo.cantidad ?? 0)) * this.f['translada_iva'].value;
    });
  }

  calcularRetencion() {
    this.retencion = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      this.retencion += ((articulo.precio_compra ?? 0) * (articulo.cantidad ?? 0)) * this.f['retiene_iva'].value;
    });
  }

  calcularTotal() {
    this.total = this.subTotal + this.iva - this.retencion;
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
          if (this.ordenCompraModel != undefined)
            this.form.patchValue({ proveedor: this.proveedores.find(x => x.id == this.ordenCompraModel?.proveedor?.id) });
        }
      },
      error: (e) => {
      }
    });

    this.catalogosService.getMetodoPago().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.metodoPagoList = data;
          if (this.ordenCompraModel != undefined) {
            let selectedMetodoPago = data.find(x => x.id == this.ordenCompraModel.metodo_pago?.id);
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

    this.catalogosService.getFormaPagoById(this.f['condicion_pago'].value == 'contado' ? 0 : 1).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.formaPagoList = data;
          if (this.ordenCompraModel != undefined) {
            let selectedFormaPago = data.find(x => x.id == this.ordenCompraModel.forma_pago?.id);
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

  clearAutocompleteInputProveedor() {
    try {
      this.f['proveedor'].reset();
    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  onCondicionPagoChange(event: any) {
    event.value == 'credito' ? this.form.controls['tiene_dias_credito'].enable() : this.form.controls['tiene_dias_credito'].disable();
    event.value == 'credito' && this.form.controls['tiene_dias_credito'].value == true ? this.form.controls['cantidad_dias_credito'].enable() : this.form.controls['cantidad_dias_credito'].disable();
    this.loadFormaPagoSelect();
  }

  loadFormaPagoSelect() {
    this.catalogosService.getFormaPagoById(this.f['condicion_pago'].value == 'contado' ? 0 : 1).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.formaPagoList = data;
          if (this.ordenCompraModel != undefined) {
            let selectedFormaPago = data.find(x => x.id == this.ordenCompraModel?.forma_pago?.id);
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

  onTieneDiasCreditoChange() {
    const tieneDiasCredito = this.form.get('tiene_dias_credito');
    if (tieneDiasCredito?.value) {
      this.form.controls['cantidad_dias_credito'].disable();
    } else {
      this.form.controls['cantidad_dias_credito'].enable();
    }
  }

  formatearComoMoneda(valor: number | undefined): string {
    if (!valor && valor != 0)
      return 'n/a';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  getPathPhoto(photo: string): string {
    return `${environment.apiUrl}/images/articulos/${photo}`
  }

  onEdit() {
    this.action = 'edit';
    this.title = 'Guardar';
    this.form.enable();
  }

  onSubmit() {
    this.submitted = true;

    if (this.dataSourceArticulos.data.length == 0) {
      this.openSnackBarError('Debes agregar al menos un artículo para continuar.');
      return
    }

    if (this.form!.invalid)
      return;

    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
    let user = new User();
    user.id = userData.id;

    if (user.id == undefined) {
      this.openSnackBarError('No se pudo obtener la información del usuario, por favor inicia sesión de nuevo.');
      return;
    }

    let ordenCompra = new OrdenCompraModel();
    // Datos generales
    ordenCompra.id = this.id;
    ordenCompra.proveedor = this.selectedProveedor ?? undefined;
    ordenCompra.folio_interno = this.f['folio_interno'].value;
    ordenCompra.venta_id = this.f['venta_id'].value;
    ordenCompra.fecha_registro = new Date(this.f['fecha_registro'].value);
    ordenCompra.comentarios = this.f['comentarios'].value;
    ordenCompra.responsable = user;
    // forma pago
    ordenCompra.condicion_pago = this.f['condicion_pago'].value;
    ordenCompra.tiene_dias_credito = this.f['tiene_dias_credito'].value;
    ordenCompra.cantidad_dias_credito = this.f['cantidad_dias_credito'].value;
    ordenCompra.moneda = this.f['moneda'].value;
    ordenCompra.tipo_cambio = this.f['tipo_cambio'].value;
    ordenCompra.forma_pago = this.f['forma_pago'].value;
    ordenCompra.metodo_pago = this.f['metodo_pago'].value;
    // Articulos
    ordenCompra.translada_iva = parseFloat(this.f['translada_iva'].value);
    ordenCompra.retiene_iva = parseFloat(this.f['retiene_iva'].value);
    ordenCompra.articulos = this.dataSourceArticulos.data;

    if (this.action == 'new') {
      this.loadingService.show();
      this.ordenCompraService.create(ordenCompra).subscribe({
        next: (data) => {
          this.loadingService.hide();
          this._snackBar.open(`Se ha creado con éxito la orden de compra #${data.id}, podrás visualizarlo desde tu listado de ordenes de compra.`, 'cerrar', {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-success'],
            duration: 5000,
          });
          this.router.navigate(['orden-compra']);
        },
        error: (e) => {
          this.loadingService.hide();
          this.openSnackBarError(`Hubo un error al crear la orden de compra: ${e.error.error}`)
        }
      });
    } else if (this.action == 'edit') {
      this.loadingService.show();
      this.ordenCompraService.update(ordenCompra).subscribe({
        next: (data) => {
          this.loadingService.hide();
          this._snackBar.open(`Se ha actualizado con éxito la orden de compra #${data.id}, podrás visualizarlo desde tu listado de ordenes de compra.`, 'cerrar', {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-success'],
            duration: 5000,
          });
          this.router.navigate(['orden-compra']);
        },
        error: (e) => {
          this.loadingService.hide();
          this.openSnackBarError(`Hubo un error al actualizar la orden de compra: ${e.error.error}`)
        }
      });
    }
  }

  private _filter(value: any): CatalogoProveedorModel[] {
    let filterValue = "";
    if (value.cliente) {
      filterValue = value.cliente.cliente || value.cliente;
      filterValue = filterValue.toLowerCase();
    }
    return this.proveedores.filter(option => option.proveedor!.toLowerCase().includes(filterValue));
  }

  openArticuloOrdenCompraModalComponent() {
    const dialogRef = this.dialog.open(OrdenCompraArticuloComponent, {
      height: '450px',
      width: '1100px',
      data: {
        ordenCompraArticuloModelArray: this.dataSourceArticulos.data,
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

  editArticuloOrdenCompraModalComponent(ordenCompraArticuloModel: OrdenCompraArticuloModel) {
    ordenCompraArticuloModel.id = this.id;
    const dialogRef = this.dialog.open(OrdenCompraArticuloComponent, {
      height: '450px',
      width: '1100px',
      data: {
        ordenCompraArticuloModel: ordenCompraArticuloModel,
      }
    });

    dialogRef.afterClosed().subscribe(ordenCompraArticuloModel => {
      if (ordenCompraArticuloModel && ordenCompraArticuloModel !== "") {
        const existingIndex = this.dataSourceArticulos.data.findIndex(item => item.inventario?.articulo?.id === ordenCompraArticuloModel.inventario?.articulo?.id);
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

  surtirArticulo(ordenCompraArticuloModel: OrdenCompraArticuloModel) {
    ordenCompraArticuloModel.id = this.id;
    const dialogRef = this.dialog.open(OrdenCompraArticuloComponent, {
      height: '450px',
      width: '1100px',
      data: {
        ordenCompraArticuloModel: ordenCompraArticuloModel,
        esSurtir: true
      }
    });

    let cantidadSurtidaPrevio = ordenCompraArticuloModel.cantidad_surtido ?? 0;
    dialogRef.afterClosed().subscribe(ordenCompraArticuloModel => {

      if (ordenCompraArticuloModel && ordenCompraArticuloModel !== "") {
        const existingIndex = this.dataSourceArticulos.data.findIndex(item => item.inventario?.articulo?.id === ordenCompraArticuloModel.inventario?.articulo?.id);
        if (existingIndex !== -1) {
          // Si existe un objeto con el mismo id, elimínalo
          this.dataSourceArticulos.data.splice(existingIndex, 1);
        }

        let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
        ordenCompraArticuloModel.userId = userData.id;
        if (ordenCompraArticuloModel.userId == undefined) {
          this.openSnackBarError('No se pudo obtener la información del usuario, por favor inicia sesión de nuevo.');
          return;
        }

        this.ordenCompraService.surtir(ordenCompraArticuloModel).subscribe({
          next: (data) => {

            let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
            ordenCompraArticuloModel.userId = userData.id;

            // Agrega el nuevo objeto
            ordenCompraArticuloModel.cantidad_surtido = (cantidadSurtidaPrevio ?? 0) + (ordenCompraArticuloModel.cantidad_surtido ?? 0);
            this.dataSourceArticulos.data.push(ordenCompraArticuloModel);
            this.dataSourceArticulos._updateChangeSubscription();
            this.hasRecords = true;
            this.calcularTotales();

            this._snackBar.open(`Se ha surtido con éxito el artículo ${ordenCompraArticuloModel.inventario?.articulo?.descripcion}.`, 'cerrar', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['snackbar-success'],
              duration: 5000,
            });
          },
          error: (e) => {
            this.openSnackBarError(`Hubo un error al surtir el artículo: ${e.error.error}`)
          }
        });
      }
    });
  }

  removeArticulo(articulo: OrdenCompraArticuloModel) {
    const indexToRemove = this.dataSourceArticulos.data.findIndex(item => item.inventario?.articulo?.id === articulo.inventario?.articulo?.id);
    if (indexToRemove !== -1) {
      this.dataSourceArticulos.data.splice(indexToRemove, 1);
      this.dataSourceArticulos._updateChangeSubscription();
    }

    if (this.dataSourceArticulos.data.length == 0)
      this.hasRecords = false;

    this.calcularTotales();
  }

  openSnackBarError(message: string) {
    this._snackBar.open(message, 'cerrar', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
      duration: 5000,
    });
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

  validarEntero(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
        if ([8, 9, 27, 13, 46].indexOf(charCode) !== -1 ||
            (charCode === 65 && event.ctrlKey) ||
            (charCode === 67 && event.ctrlKey) ||
            (charCode === 86 && event.ctrlKey) ||
            (charCode === 88 && event.ctrlKey)) {
            return true;
        }
        event.preventDefault();
        return false;
    }
    return true;
}
}
