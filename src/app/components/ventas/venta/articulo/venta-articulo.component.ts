import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryAlmacenService } from 'src/app/services/inventory.service';
import { CatalogoAlmacenesService } from 'src/app/services/catalogo-almacenes.service';
import { ArticuloGroup, CatalogoArticuloModel } from 'src/app/models/catalogo-articulo.model';
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
import { CatalogoProductoServicioModel, CatalogoUnidadMedidaModel } from 'src/app/models/catalogos.model';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { VentaArticuloModel } from 'src/app/models/ventas.model';
import { InventorySucursalModel } from 'src/app/models/inventory-sucursal.model';
import { User } from 'src/app/models/user';
import { VentaService } from 'src/app/services/ventas.service';


export const _filter = (opt: CatalogoArticuloModel[], value: string): CatalogoArticuloModel[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.part_number!.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'app-venta-articulo',
  templateUrl: './venta-articulo.component.html',
  styleUrls: ['./venta-articulo.component.css']
})

export class VentaArticuloComponent implements OnInit, OnDestroy {

  action: string = 'Agregar';
  form: FormGroup;
  submitted = false;
  stock: number | undefined = 0;

  isAlmacen: boolean = true;

  selectedAlmacen: CatalogoAlmacenModel | null = null;
  almacenes: CatalogoAlmacenModel[] = [];

  selectedSucursal: CatalogoSucursalModel | null = null;
  sucursales: CatalogoSucursalModel[] = [];

  productoServicioList: CatalogoProductoServicioModel[] = [];
  unidadMedidaList: CatalogoUnidadMedidaModel[] = [];

  imageUrl: string | null = null;

  articuloGroups: ArticuloGroup[] = [];
  articuloGroupOptions!: Observable<ArticuloGroup[]>;
  selectedArticle: CatalogoArticuloModel | undefined = undefined;

  subtotal: number = 0;

  @Output() cancel = new EventEmitter();
  @Output() add = new EventEmitter<VentaArticuloModel>();

  @Input() ventaArticuloModel: VentaArticuloModel | undefined;
  @Input() ventaArticulosModel: VentaArticuloModel[] | undefined;
  @Input() clienteId: number = 0;
  @Input() isDespachar: boolean = false;

  isEditing: boolean = false;
  hasBackOrder: boolean = false;

  inventory_almacen_id = 0;

  filteredProductoServicio: Observable<any[]> | undefined;
  filteredUnidadMedida: Observable<any[]> | undefined;

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private inventoryAlmacenService: InventoryAlmacenService,
    private catalogoAlmacenesService: CatalogoAlmacenesService,
    private catalogoSucursalesService: CatalogoSucursalesService,
    private router: Router,
    private catalogosService: CatalogosService,
    private catalogoArticuloService: CatalogoArticuloService,
    private dialog: MatDialog,
    private ventaService: VentaService,) {

    this.form = this.formBuilder.group({
      tipoAlmacen: ['almacen'],
      almacen: [null],
      sucursal: [null],
      selectedArticle: [null, Validators.required],
      qty: [1, [Validators.min(1)]],
      precio_venta: [0, [Validators.required, Validators.min(0.01)]],
      descuento: 0,
      comentarios: '',
      articulosCliente: false,
      backorder: 0,
      numero_identificacion_fiscal: [''],
      unidad_medida: ['producto'],
      producto_servicio_model: [null, Validators.required, [this.validarProductoServicio.bind(this)]],
      unidad_medida_model: [null, Validators.required, [this.validarUnidadMedida.bind(this)]]
    });

    this.form.controls['precio_venta'].disable();
    this.form.controls['descuento'].disable();
  }

  validarProductoServicio(control: FormControl): Observable<any> {
    const valor = control.value;
    return new Observable(observer => {
      if (this.productoServicioList.some(option => option.name === valor || option === valor)) {
        observer.next(null); // Válido
      } else {
        observer.next({ invalidOption: true }); // Inválido
      }
      observer.complete();
    });
  }

  validarUnidadMedida(control: FormControl): Observable<any> {
    const valor = control.value;
    return new Observable(observer => {
      if (this.unidadMedidaList.some(option => option.name === valor || option === valor)) {
        observer.next(null); // Válido
      } else {
        observer.next({ invalidOption: true }); // Inválido
      }
      observer.complete();
    });
  }

  displayFn(option: any): string {
    return option ? `${option.key} - ${option.name}` : '';
  }

  displayFnUnidadMedida(option: any): string {
    return option ? `${option.key} - ${option.name}` : '';
  }

  ngOnInit() {
    try {
      this.catalogoAlmacenesService.getAll().subscribe({
        next: (data) => {
          this.almacenes = data;
          if (data.length > 0) {
            this.selectedAlmacen = data[0];
            this.loadArticulos();
          }
        },
        error: (e) => {
        }
      });

      this.catalogoSucursalesService.getAll().subscribe({
        next: (data) => {
          this.sucursales = data;
          if (data.length > 0)
            this.selectedSucursal = data[0];
        },
        error: (e) => {
        }
      });

      this.form.controls['selectedArticle'].valueChanges.subscribe((newValue) => {
        this.onOptionSelected(newValue);
      });

      this.filteredProductoServicio = this.form.controls['producto_servicio_model'].valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
      );

      this.filteredUnidadMedida = this.form.controls['unidad_medida_model'].valueChanges.pipe(
        startWith(''),
        map(value => this._filterUnidadMedida(value))
      );

      if (this.ventaArticuloModel != null) {
        this.isEditing = true;
        this.action = 'Editar';
        this.f['selectedArticle'].disable();
        this.f['tipoAlmacen'].disable();
        this.f['almacen'].disable();
        this.f['sucursal'].disable();
        this.f['producto_servicio_model'].disable();
        this.f['unidad_medida_model'].disable();

        this.form.controls['precio_venta'].enable();
        this.form.controls['descuento'].enable();
      }

      this.catalogosService.getProductoServicio().subscribe({
        next: (data) => {
          this.productoServicioList = data;
        },
        error: (e) => {
          console.error(e);
        }
      });

      this.catalogosService.getUnidadMedida().subscribe({
        next: (data) => {
          this.unidadMedidaList = data;
        },
        error: (e) => {
          console.error(e);
        }
      });

    } catch (error) {
      console.error('An error occurred in ngOnInit:', error);
    }
  }

  ngOnDestroy() {
    this.clearAutocompleteInput();
  }

  loadEdit(ventaArticuloModel: VentaArticuloModel) {
    if (this.isAlmacen)
      if (ventaArticuloModel.almacen?.articulo?.part_number) {
        this.form.patchValue({
          selectedArticle: ventaArticuloModel.almacen?.articulo?.part_number,
          qty: this.isDespachar ? 0 : ventaArticuloModel.cantidad,
          descuento: ventaArticuloModel.descuento,
          comentarios: ventaArticuloModel.comentarios,
          backorder: 0,
          numero_identificacion_fiscal: ventaArticuloModel.numero_identificacion_fiscal,
          unidad_medida: ventaArticuloModel.unidad_medida,
          producto_servicio_model: ventaArticuloModel.producto_servicio_model,
          unidad_medida_model: ventaArticuloModel.unidad_medida_model
        });
        //this.onOptionSelected(ventaArticuloModel.almacen?.articulo?.part_number);
        this.calcularBackOrder();
      }
  }

  get f() { return this.form!.controls; }

  getUrlPhoto(articulo: CatalogoArticuloModel): string {
    try {
      return articulo.photo != '' ? `${environment.apiUrl}/images/articulos/${articulo.photo}` : '../../assets/images/empty-image.png';
    } catch (error) {
      console.error('An error occurred in getUrlPhoto:', error);
      return "../../assets/images/empty-image.png";
    }
  }

  navigate(route: string) {
    try {
      this.router.navigate([route]);
    } catch (error) {
      console.error('An error occurred in navigate:', error);
    }
  }

  handleScannedValue(value: string) {
    try {
      this.f['selectedArticle'].setValue(value);
    } catch (error) {
      console.error('An error occurred in handleScannedValue:', error);
    }
  }

  trackGroupFn(index: number, group: ArticuloGroup): number {
    try {
      return group.categoria!.id ?? 0;
    } catch (error) {
      console.error('An error occurred in trackGroupFn:', error);
      return 0;
    }
  }

  trackArticuloFn(index: number, articulo: any): number {
    try {
      return articulo.id ?? 0;
    } catch (error) {
      console.error('An error occurred in trackArticuloFn:', error);
      return 0;
    }
  }

  clearAutocompleteInput() {
    try {
      this.f['selectedArticle'].reset();
      this.imageUrl = null;
      this.form.controls['precio_venta'].reset();
      this.form.controls['descuento'].reset();
      this.form.controls['qty'].reset();
      this.form.controls['comentarios'].reset();
      this.form.controls['numero_identificacion_fiscal'].reset();
      this.form.controls['unidad_medida'].reset();
      this.form.controls['backorder'].reset();
      this.form.controls['producto_servicio_model'].reset();
      this.form.controls['unidad_medida_model'].reset();
      this.hasBackOrder = false;
      this.stock = 0;

    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  openDialogEscanner() {
    const dialogRef = this.dialog.open(DialogEscannerComponent, {
      data: {
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result)
        this.f['selectedArticle'].setValue(result);
    });
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

  calcularSubTotal() {
    this.subtotal = ((this.f['precio_venta'].value * this.f['qty'].value) - this.f['descuento'].value);
  }

  onRadioChange(event: MatRadioChange) {
    this.isAlmacen = event.value == 'almacen';
  }

  onAlmacenChange(event: any) {
    this.clearAutocompleteInput();
    this.loadArticulos();
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

  loadArticulos() {
    if (this.isAlmacen && this.selectedAlmacen && this.selectedAlmacen.id) {
      this.catalogoArticuloService.getAllGroupedByCategoryByAlmacen(this.selectedAlmacen.id, this.f['articulosCliente'].value ? 0 : this.clienteId).subscribe({
        next: (data) => {
          this.articuloGroups = data;

          if (this.ventaArticulosModel?.length ?? 0 > 0)
            this.articuloGroups.forEach(articuloGroup => {
              articuloGroup.articulos = articuloGroup.articulos?.filter((articulo) => {
                let exist = false;

                this.ventaArticulosModel?.forEach(ventaArticulo => {
                  if (this.selectedAlmacen?.id == ventaArticulo?.almacen?.almacen?.id && ventaArticulo?.almacen?.articulo?.id == articulo.id) {
                    exist = true;
                  }
                });

                return !exist;
              });
            });

          this.articuloGroups = this.articuloGroups.filter(group => group.articulos && group.articulos.length > 0);

          this.articuloGroupOptions = this.form.get('selectedArticle')!.valueChanges.pipe(
            startWith(''),
            map(value => this._filterGroup(value || '')),
          );

          if (this.ventaArticuloModel != null) {
            this.loadEdit(this.ventaArticuloModel);
            this.f['selectedArticle'].disable();
          }
        },
        error: (e) => {
        }
      });
    }

  }

  onOptionSelected(partNumber: string) {
    try {
      this.selectedArticle = this.getArticuloByPartNumber(partNumber);

      if (!this.selectedArticle) {
        this.form.controls['precio_venta'].disable();
        this.form.controls['descuento'].disable();
        return;
      }

      if (!this.isDespachar) {
        this.form.controls['precio_venta'].enable();
        this.form.controls['descuento'].enable();
      }

      if (this.selectedArticle.photo) {
        this.imageUrl = `${environment.apiUrl}/images/articulos/${this.selectedArticle.photo}`;
      }

      if (this.clienteId !== 0 && this.selectedAlmacen?.id) {
        this.catalogoArticuloService.getAllGroupedByCategoryByAlmacen(this.selectedAlmacen.id, this.clienteId).subscribe({
          next: (data) => {
            if (data?.length > 0) {
              const articulos = data[0].articulos || [];
              const articuloEncontrado = articulos.find(art => art.id === this.selectedArticle?.id);
              if (articuloEncontrado) {
                this.selectedArticle = articuloEncontrado;
                this.actualizarDatosArticulo();
              }
            }

            this.calcularSubTotal();
          },
          error: (error) => console.error('Error obteniendo artículos:', error)
        });
      } else {
        this.actualizarDatosArticulo();
        this.calcularSubTotal();
      }
    } catch (error) {
      console.error('Error en onOptionSelected:', error);
    }
  }

  getArticuloByPartNumber(partNumber: string): CatalogoArticuloModel | undefined {

    try {
      for (const group of this.articuloGroups) {
        const foundArticulo = group.articulos!.find(articulo => articulo.part_number === partNumber);
        if (foundArticulo) {
          return foundArticulo;
        }
      }
      return undefined;
    } catch (error) {
      console.error('An error occurred in getArticuloByPartNumber:', error);
      return undefined;
    }
  }

  agregarQty() {
    try {
      if (this.selectedArticle == undefined || (this.isDespachar && ((this.stock != undefined && this.f['qty'].value >= this.stock) || this.f['backorder'].value <= 0)))
        return;

      if (this.stock != undefined && ((this.isDespachar && this.f['qty'].value <= this.stock) || !this.isDespachar))
        this.f['qty'].setValue(this.f['qty'].value + 1);

      this.calcularSubTotal();
      this.calcularBackOrder();
    } catch (error) {
      console.error('An error occurred in agregarQty:', error);
    }
  }

  restarQty() {
    try {
      if (this.f['qty'].value > 1)
        this.f['qty'].setValue(this.f['qty'].value - 1);

      this.calcularSubTotal();
      this.calcularBackOrder();
    } catch (error) {
      console.error('An error occurred in restarQty:', error);
    }
  }

  onAdd() {
    try {
      this.submitted = true;
      if (this.form!.invalid == false && this.isDespachar == false) {
        let ventaArticuloModel = new VentaArticuloModel();
        ventaArticuloModel.inventory_almacen_id = this.inventory_almacen_id;
        ventaArticuloModel.precio_venta = this.f['precio_venta'].value;
        ventaArticuloModel.descuento = this.f['descuento'].value;
        ventaArticuloModel.cantidad = this.f['qty'].value;
        ventaArticuloModel.backorder = this.f['backorder'].value;
        ventaArticuloModel.comentarios = this.f['comentarios'].value;

        ventaArticuloModel.numero_identificacion_fiscal = this.f['numero_identificacion_fiscal'].value;
        ventaArticuloModel.unidad_medida = this.f['unidad_medida'].value;
        ventaArticuloModel.producto_servicio_model = this.f['producto_servicio_model'].value;
        ventaArticuloModel.unidad_medida_model = this.f['unidad_medida_model'].value;

        if (this.selectedAlmacen) {
          let inventoryAlmacenModel = new InventoryAlmacenModel();
          inventoryAlmacenModel.almacen = this.selectedAlmacen;
          inventoryAlmacenModel.articulo = this.selectedArticle;
          ventaArticuloModel.almacen = inventoryAlmacenModel;
        }

        if (this.selectedSucursal) {
          let inventorySucursalModel = new InventorySucursalModel();
          inventorySucursalModel.sucursal = this.selectedSucursal;
          inventorySucursalModel.articulo = this.selectedArticle;
          ventaArticuloModel.sucursal = inventorySucursalModel;
        }

        this.add.emit(ventaArticuloModel);
      } else if (this.isDespachar == true) {
        // stop here if form is invalid
        if (this.form!.invalid)
          return;

        let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
        let user = new User();
        user.id = userData.id;

        let ventaArticuloModel = new VentaArticuloModel();
        ventaArticuloModel.id = this.ventaArticuloModel?.id;
        ventaArticuloModel.cantidad = this.f['qty'].value;
        ventaArticuloModel.comentarios = this.f['comentarios'].value;
        ventaArticuloModel.user = user;
        ventaArticuloModel.inventory_almacen_id = this.inventory_almacen_id;
        ventaArticuloModel.ventaId = this.ventaArticuloModel?.ventaId;

        this.ventaService.despachar(ventaArticuloModel).subscribe({
          next: (data) => {
            this.add.emit(ventaArticuloModel);
          },
          error: (e) => {
            console.log(e);
          }
        });
      }
    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }

  onCancel() {
    try {
      this.cancel.emit();
    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }

  private actualizarDatosArticulo() {

    this.form.patchValue({
      precio_venta: this.isEditing ? this.ventaArticuloModel?.precio_venta : this.selectedArticle?.precio_venta,
      numero_identificacion_fiscal: this.isEditing ? this.ventaArticuloModel?.numero_identificacion_fiscal : this.selectedArticle?.numero_identificacion_fiscal,
      unidad_medida: this.isEditing ? this.ventaArticuloModel?.unidad_medida : this.selectedArticle?.unidad_medida,
      producto_servicio_model: this.isEditing ? this.ventaArticuloModel?.producto_servicio_model : this.selectedArticle?.producto_servicio_model,
      unidad_medida_model: this.isEditing ? this.ventaArticuloModel?.unidad_medida_model : this.selectedArticle?.unidad_medida_model,
    });

    if (this.isEditing) {
      var productoServicio = this.productoServicioList.filter(p => p.key == this.f['producto_servicio_model'].value.key)
      if (productoServicio.length > 0)
        this.f['producto_servicio_model'].setValue(productoServicio[0]);

      var unidadMedida = this.unidadMedidaList.filter(p => p.key == this.f['unidad_medida_model'].value.key)
      if (unidadMedida.length > 0)
        this.f['unidad_medida_model'].setValue(unidadMedida[0]);
    } else {

      if (this.f['unidad_medida_model'].value && this.f['unidad_medida_model'].value.key) {
        var unidadMedida = this.unidadMedidaList.filter(p => p.key == this.f['unidad_medida_model'].value.key)
        if (unidadMedida.length > 0)
          this.f['unidad_medida_model'].setValue(unidadMedida[0]);
      } else
        this.f['unidad_medida_model'].setValue(null);

      if (this.f['producto_servicio_model'].value && this.f['producto_servicio_model'].value.key) {
        var productoServicio = this.productoServicioList.filter(p => p.key == this.f['producto_servicio_model'].value.key)
        if (productoServicio.length > 0)
          this.f['producto_servicio_model'].setValue(productoServicio[0]);
      } else
        this.f['producto_servicio_model'].setValue(null);
    }

    this.inventoryAlmacenService.getInventoryByAlmacenByArticulo(this.selectedAlmacen?.id, this.selectedArticle?.id).subscribe({
      next: (data) => {
        this.inventory_almacen_id = data?.id ?? 0;
        this.stock = data?.inventory_transaction?.[0]?.stock ?? 0;
        this.calcularBackOrder();
      },
      error: (error) => console.error('Error obteniendo inventario:', error)
    });

  }

  private calcularBackOrder() {
    if (!this.isDespachar)
      this.form.patchValue({
        backorder: this.f['qty'].value > (this.stock || 0) ? (((this.stock || 0) - this.f['qty'].value) * -1) : 0
      });
    else
      if (this.ventaArticuloModel != undefined && this.ventaArticuloModel.backorder != undefined)
        this.form.patchValue({
          backorder: this.ventaArticuloModel.backorder - this.f['qty'].value
        });

    this.hasBackOrder = this.f['backorder'].value > 0
  }

  private _filterGroup(value: string): ArticuloGroup[] {
    try {
      if (value) {
        return this.articuloGroups
          .map(group => ({ categoria: group.categoria, articulos: _filter(group.articulos!, value) }))
          .filter(group => group.articulos.length > 0);
      }

      return this.articuloGroups;
    } catch (error) {
      console.error('An error occurred in _filterGroup:', error);
      return [];
    }
  }

  private _filter(value: any): any[] {
    if (!value) {
      return [];
    }

    if (typeof value === 'object') {
      value = value.name ?? '';
    }

    if (value.length < 3) {
      return [];
    }

    const filterValue = value.toLowerCase();
    return this.productoServicioList.filter(option =>
      option.name?.toLowerCase().includes(filterValue)
    );
  }

  private _filterUnidadMedida(value: any): any[] {
    if (!value) {
      return [];
    }

    if (typeof value === 'object') {
      value = value.name ?? '';
    }

    if (value.length < 3) {
      return [];
    }

    const filterValue = value.toLowerCase();
    return this.unidadMedidaList.filter(option =>
      option.name?.toLowerCase().includes(filterValue)
    );
  }
}

@Component({
  selector: 'dialog-component',
  template: `<h2 mat-dialog-title>Escanear codigo de barras</h2>
            <mat-dialog-content class="mat-typography">
              <app-barcode-scanner #appBarcodeScanner (scannedValue)="handleScannedValue($event)"></app-barcode-scanner>
            </mat-dialog-content>
            <mat-dialog-actions align="end">
              <button mat-button mat-dialog-close>Cancel</button>
            </mat-dialog-actions>`,
  styles: [],
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    BarcodeScannerComponent
  ]
})
export class DialogEscannerComponent {
  @ViewChild('appBarcodeScanner', { static: false }) appBarcodeScanner: BarcodeScannerComponent | undefined;

  constructor(
    public dialogRef: MatDialogRef<DialogEscannerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, content: string }
  ) { }

  ngAfterViewInit() {
    this.dialogRef.afterOpened().subscribe(() => {
      this.appBarcodeScanner?.start();
    });
  }

  handleScannedValue(value: String) {
    try {
      this.dialogRef.close(value);
    } catch (error) {
      console.error('An error occurred in handleScannedValue:', error);
    }
  }
}
