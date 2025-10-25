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
import { CatalogosService } from 'src/app/services/catalogos.service';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { VentaService } from 'src/app/services/ventas.service';
import { OrdenCompraArticuloModel } from 'src/app/models/orden-compra.model';

export const _filter = (opt: CatalogoArticuloModel[], value: string): CatalogoArticuloModel[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.part_number!.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'app-orden-compra-articulo',
  templateUrl: './orden-compra-articulo.component.html',
  styleUrls: ['./orden-compra-articulo.component.css']
})
export class OrdenCompraArticuloComponent implements OnInit, OnDestroy {

  action: string = 'Agregar';
  title: string = 'Agregar artículos orden de compra';
  form: FormGroup;
  submitted = false;

  selectedAlmacen: CatalogoAlmacenModel | null = null;
  almacenes: CatalogoAlmacenModel[] = [];

  imageUrl: string | null = null;

  articuloGroups: ArticuloGroup[] = [];
  articuloGroupOptions!: Observable<ArticuloGroup[]>;
  selectedArticle: CatalogoArticuloModel | undefined = undefined;

  subtotal: number = 0;

  @Output() cancel = new EventEmitter();
  @Output() add = new EventEmitter<OrdenCompraArticuloModel>();

  ordenCompraArticuloModel: OrdenCompraArticuloModel | undefined;
  ordenCompraArticuloModelArray: OrdenCompraArticuloModel[] | undefined;
  esSurtir: boolean = false;

  isEditing: boolean = false;
  inventory_almacen_id = 0;

  constructor(
    public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private inventoryAlmacenService: InventoryAlmacenService,
    private catalogoAlmacenesService: CatalogoAlmacenesService,
    private router: Router,
    private catalogosService: CatalogosService,
    private catalogoArticuloService: CatalogoArticuloService,
    private dialog: MatDialog,
    private ventaService: VentaService,
    public dialogRef: MatDialogRef<OrdenCompraArticuloComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.form = this.formBuilder.group({
      almacen: [null],
      selectedArticle: [null, Validators.required],
      cantidad: [1, [Validators.min(1)]],
      precio_compra: [0, [Validators.required, Validators.min(0.01)]],
    });

    this.form.controls['precio_compra'].disable();
  }

  ngOnInit() {
    try {

      if (this.data) {
        this.ordenCompraArticuloModel = this.data.ordenCompraArticuloModel;
        this.ordenCompraArticuloModelArray = this.data.ordenCompraArticuloModelArray;
        this.esSurtir = this.data.esSurtir ?? false;
      }

      if (this.esSurtir) {
        this.form.addControl(
          'cantidad_surtido',
          this.formBuilder.control(
            this.ordenCompraArticuloModel?.cantidad_surtido ?? 0,
            [
              Validators.min(this.ordenCompraArticuloModel?.cantidad_surtido ? (this.ordenCompraArticuloModel?.cantidad_surtido + 1) : 1),
              Validators.max(this.ordenCompraArticuloModel?.cantidad ?? 1)
            ]
          )
        );
      }

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

      this.form.controls['selectedArticle'].valueChanges.subscribe((newValue) => {
        this.onOptionSelected(newValue);
      });

      if (this.ordenCompraArticuloModel != null) {
        this.isEditing = true;
        this.action = this.esSurtir ? 'Surtir' : 'Editar';
        this.title = this.esSurtir ? 'Surtir artículo orden de compra' : 'Editar artículo orden de compra';
        this.f['selectedArticle'].disable();
        this.f['almacen'].disable();
        this.form.controls['precio_compra'].disable();

        if (this.esSurtir) {
          this.form.controls['cantidad'].disable();
          this.form.controls['precio_compra'].disable();
        }
      }

    } catch (error) {
      console.error('An error occurred in ngOnInit:', error);
    }
  }

  ngOnDestroy() {
    this.clearAutocompleteInput();
  }

  loadEdit(ordenCompraArticuloModel: OrdenCompraArticuloModel) {
    if (ordenCompraArticuloModel.inventario?.articulo?.part_number) {
      this.form.patchValue({
        selectedArticle: ordenCompraArticuloModel.inventario?.articulo?.part_number,
        cantidad: ordenCompraArticuloModel.cantidad,
        precio_compra: ordenCompraArticuloModel.precio_compra,
      });
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
      this.form.controls['precio_compra'].reset();
      this.form.controls['cantidad'].reset();
      this.subtotal = 0;
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
    this.subtotal = (this.f['precio_compra'].value * this.f['cantidad'].value);
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
    if (this.selectedAlmacen && this.selectedAlmacen.id) {
      this.catalogoArticuloService.getAllGroupedByCategoryByAlmacen(this.selectedAlmacen.id, 0).subscribe({
        next: (data) => {
          this.articuloGroups = data;

          if (this.ordenCompraArticuloModelArray?.length ?? 0 > 0)
            this.articuloGroups.forEach(articuloGroup => {
              articuloGroup.articulos = articuloGroup.articulos?.filter((articulo) => {
                let exist = false;

                this.ordenCompraArticuloModelArray?.forEach(ordenCompraArticulo => {
                  if (this.selectedAlmacen?.id == ordenCompraArticulo?.inventario?.almacen?.id && ordenCompraArticulo?.inventario?.articulo?.id == articulo.id) {
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

          if (this.ordenCompraArticuloModel != null) {
            this.loadEdit(this.ordenCompraArticuloModel);
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
        this.form.controls['precio_compra'].disable();
        return;
      } else {
        if (!this.esSurtir)
          this.form.controls['precio_compra'].enable();
      }

      this.imageUrl = null;

      if (this.selectedArticle.photo) {
        this.imageUrl = `${environment.apiUrl}/images/articulos/${this.selectedArticle.photo}`;
      }

      this.actualizarDatosArticulo();
      this.calcularSubTotal();
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
      if (this.selectedArticle == undefined)
        return;

      if (this.esSurtir) {
        const currentValueSurtir = this.f['cantidad_surtido'].value || 0;
        this.f['cantidad_surtido'].setValue(currentValueSurtir + 1);
      } else {
        const currentValue = this.f['cantidad'].value || 0;
        this.f['cantidad'].setValue(currentValue + 1);
      }
      this.calcularSubTotal();
    } catch (error) {
      console.error('An error occurred in agregarQty:', error);
    }
  }

  restarQty() {
    try {
      if (this.selectedArticle == undefined)
        return;

      if (this.esSurtir) {
        const currentValueSurtir = this.f['cantidad_surtido'].value || 0;
        if (currentValueSurtir > 1) {
          this.f['cantidad_surtido'].setValue(currentValueSurtir - 1);
          this.calcularSubTotal();
        }
      } else {
        const currentValue = this.f['cantidad'].value || 0;
        if (currentValue > 1) {
          this.f['cantidad'].setValue(currentValue - 1);
          this.calcularSubTotal();
        }
      }
    } catch (error) {
      console.error('An error occurred in restarQty:', error);
    }
  }

  onAdd() {
    try {
      this.submitted = true;
      if (this.form!.invalid == false) {
        let ordenCompraArticuloModel = new OrdenCompraArticuloModel();
        ordenCompraArticuloModel.inventory_almacen_id = this.inventory_almacen_id;
        ordenCompraArticuloModel.precio_compra = this.f['precio_compra'].value;
        ordenCompraArticuloModel.cantidad = this.f['cantidad'].value;
        ordenCompraArticuloModel.id = this.ordenCompraArticuloModel?.id ?? 0;

        if (this.esSurtir) {
          ordenCompraArticuloModel.cantidad_surtido = (this.f['cantidad_surtido'].value - (this.ordenCompraArticuloModel?.cantidad_surtido ?? 0));
        }

        if (this.selectedAlmacen) {
          let inventoryAlmacenModel = new InventoryAlmacenModel();
          inventoryAlmacenModel.almacen = this.selectedAlmacen;
          inventoryAlmacenModel.articulo = this.selectedArticle;
          ordenCompraArticuloModel.inventario = inventoryAlmacenModel;
        }

        this.dialogRef.close(ordenCompraArticuloModel);
      }
    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }

  onCancel() {
    try {
      this.dialogRef.close();
    } catch (error) {
      console.error('An error occurred in onCancel:', error);
    }
  }

  private actualizarDatosArticulo() {
    this.form.patchValue({
      precio_compra: this.isEditing ? this.ordenCompraArticuloModel?.precio_compra : this.selectedArticle?.costo_proveedor,
      cantidad: this.isEditing ? this.ordenCompraArticuloModel?.cantidad : 1,
    });

    this.inventoryAlmacenService.getInventoryByAlmacenByArticulo(this.selectedAlmacen?.id, this.selectedArticle?.id).subscribe({
      next: (data) => {
        this.inventory_almacen_id = data?.id ?? 0;
      },
      error: (error) => console.error('Error obteniendo inventario:', error)
    });
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
}

@Component({
  selector: 'dialog-component-escaner-orden-compra-articulo',
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
