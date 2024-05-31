import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { CatalogoProductoServicioModel } from 'src/app/models/catalogos.model';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { VentaArticuloModel } from 'src/app/models/ventas.model';
import { InventorySucursalModel } from 'src/app/models/inventory-sucursal.model';


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

  selectedProductoServicio: CatalogoProductoServicioModel | null = null;
  productoServicioList: CatalogoProductoServicioModel[] = [];

  imageUrl: string | null = null;

  articuloGroups: ArticuloGroup[] = [];
  articuloGroupOptions!: Observable<ArticuloGroup[]>;
  selectedArticle: CatalogoArticuloModel | undefined = undefined;

  subtotal: number = 0;

  @Output() cancel = new EventEmitter();
  @Output() add = new EventEmitter<VentaArticuloModel>();

  @Input() ventaArticuloModel: VentaArticuloModel | undefined;
  @Input() ventaArticulosModel: VentaArticuloModel[] | undefined;

  isEditing: boolean = false;

  inventory_almacen_id = 0;

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private inventoryAlmacenService: InventoryAlmacenService,
    private catalogoAlmacenesService: CatalogoAlmacenesService,
    private catalogoSucursalesService: CatalogoSucursalesService,
    private router: Router,
    private catalogosService: CatalogosService,
    private catalogoArticuloService: CatalogoArticuloService,
    private dialog: MatDialog) {

    this.form = this.formBuilder.group({
      tipoAlmacen: ['almacen'],
      almacen: [null],
      sucursal: [null],
      selectedArticle: [null, Validators.required],
      qty: 1,
      precio_venta: [0, [Validators.required, Validators.min(0.01)]],
      descuento: 0,
      comentarios: '',
      unidad_medida: ['producto'],
      numero_identificacion_fiscal: ['']
    });
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

      this.catalogosService.getProductoServicio().subscribe({
        next: (data) => {
          this.productoServicioList = data;
          if (data.length > 0)
            this.selectedProductoServicio = data[0];
        },
        error: (e) => {
        }
      });

      this.form.controls['selectedArticle'].valueChanges.subscribe((newValue) => {
        this.onOptionSelected(newValue);
      });

      if (this.ventaArticuloModel != null) {
        this.isEditing = true;
        this.action = 'Editar';
        this.f['selectedArticle'].disable();
        this.f['tipoAlmacen'].disable();
        this.f['almacen'].disable();
        this.f['sucursal'].disable();
      }
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
          qty: ventaArticuloModel.cantidad,
          descuento: ventaArticuloModel.descuento,
          comentarios: ventaArticuloModel.comentarios,
          unidad_medida: ventaArticuloModel.unidad_medida,
          numero_identificacion_fiscal: ventaArticuloModel.numero_identificacion_fiscal
        });
        this.onOptionSelected(ventaArticuloModel.almacen?.articulo?.part_number);
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

  getStock(): number {
    try {
      const qtyValue = this.f['qty'].value;
      const qty = qtyValue ? parseInt(qtyValue) : 0;
      return (this.stock ?? 0) + qty;
    } catch (error) {
      console.error('An error occurred in getStock:', error);
      return 0;
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
      this.catalogoArticuloService.getAllGroupedByCategoryByAlmacen(this.selectedAlmacen.id).subscribe({
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
      if (this.selectedArticle != undefined) {
        if (this.selectedArticle.photo)
          this.imageUrl = `${environment.apiUrl}/images/articulos/${this.selectedArticle.photo}`;

        this.form.patchValue({
          precio_venta: this.isEditing ? this.ventaArticuloModel?.precio_venta : this.selectedArticle.precio_venta
        });

        this.calcularSubTotal();

        this.inventoryAlmacenService.getInventoryByAlmacenByArticulo(this.selectedAlmacen?.id, this.selectedArticle.id).subscribe({
          next: (data) => {
            if (data && data.id) {
              this.inventory_almacen_id = data.id;
              if (data.inventory_transaction && data.inventory_transaction.length > 0) {
                this.stock = data.inventory_transaction[0]?.stock;
              } else
                this.stock = 0;
            } else {
              this.stock = 0;
            }
          }
        });
      }
    } catch (error) {
      console.error('An error occurred in onOptionSelected:', error);
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
      if (this.stock != undefined)
        this.f['qty'].setValue(this.f['qty'].value + 1);

      this.calcularSubTotal();
    } catch (error) {
      console.error('An error occurred in agregarQty:', error);
    }
  }

  restarQty() {
    try {
      if (this.f['qty'].value > 1)
        this.f['qty'].setValue(this.f['qty'].value - 1);

      this.calcularSubTotal();
    } catch (error) {
      console.error('An error occurred in restarQty:', error);
    }
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

  onAdd() {
    try {
      this.submitted = true;
      if (this.form!.invalid == false) {
        let ventaArticuloModel = new VentaArticuloModel();
        ventaArticuloModel.inventory_almacen_id = this.inventory_almacen_id;
        ventaArticuloModel.precio_venta = this.f['precio_venta'].value;
        ventaArticuloModel.descuento = this.f['descuento'].value;
        ventaArticuloModel.cantidad = this.f['qty'].value;
        ventaArticuloModel.numero_identificacion_fiscal = this.f['numero_identificacion_fiscal'].value;
        ventaArticuloModel.unidad_medida = this.f['unidad_medida'].value;
        ventaArticuloModel.comentarios = this.f['comentarios'].value;

        if (this.selectedProductoServicio)
          ventaArticuloModel.producto_servicio = this.selectedProductoServicio;

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