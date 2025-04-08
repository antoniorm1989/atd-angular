import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticuloGroup, CatalogoArticuloModel } from 'src/app/models/catalogo-articulo.model';
import { environment } from 'src/environments/environment';
import { Observable, map, startWith } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BarcodeScannerComponent } from 'src/app/components/genericos/barcodesScanner.component';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { ClienteArticuloModel } from 'src/app/models/catalogo-cliente.model';


export const _filter = (opt: CatalogoArticuloModel[], value: string): CatalogoArticuloModel[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.part_number!.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'app-cliente-articulo',
  templateUrl: './cliente-articulo.component.html',
  styleUrls: ['./cliente-articulo.component.css']
})

export class ClienteArticuloComponent implements OnInit, OnDestroy {

  action: string = 'Agregar';
  form: FormGroup;
  submitted = false;

  imageUrl: string | null = null;

  articuloGroups: ArticuloGroup[] = [];
  articuloGroupOptions!: Observable<ArticuloGroup[]>;
  selectedArticle: CatalogoArticuloModel | undefined = undefined;

  subtotal: number = 0;

  @Output() cancel = new EventEmitter();
  @Output() add = new EventEmitter<ClienteArticuloModel>();

  @Input() clienteArticuloModel: ClienteArticuloModel | undefined;
  @Input() clienteArticulosModel: ClienteArticuloModel[] | undefined;

  isEditing: boolean = false;

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private catalogoArticuloService: CatalogoArticuloService,
    private dialog: MatDialog) {

    this.form = this.formBuilder.group({
      selectedArticle: [null, Validators.required],
      precio_cliente: [0, [Validators.required, Validators.min(0.01)]],
      descuento: 0,
      comentarios: '',
    });
  }

  ngOnInit() {
    try {

      this.form.controls['selectedArticle'].valueChanges.subscribe((newValue) => {
        this.onOptionSelected(newValue);
      });

      if (this.clienteArticuloModel != null) {
        this.isEditing = true;
        this.action = 'Editar';
        this.f['selectedArticle'].disable();
      }

      this.loadArticulos();
      
    } catch (error) {
      console.error('An error occurred in ngOnInit:', error);
    }
  }

  ngOnDestroy() {
    this.clearAutocompleteInput();
  }

  loadEdit(clienteArticuloModel: ClienteArticuloModel) {
    if (clienteArticuloModel.articulo?.part_number) {
      this.form.patchValue({
        selectedArticle: clienteArticuloModel.articulo?.part_number,
        precio_cliente: clienteArticuloModel.precio,
        descuento: clienteArticuloModel.descuento,
        comentarios: clienteArticuloModel.comentarios,
      });
      this.onOptionSelected(clienteArticuloModel.articulo?.part_number);
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

    this.catalogoArticuloService.getAllGroupedByCategory().subscribe({
      next: (data) => {
        this.articuloGroups = data;

        if (this.clienteArticulosModel?.length ?? 0 > 0)
          this.articuloGroups.forEach(articuloGroup => {
            articuloGroup.articulos = articuloGroup.articulos?.filter((articulo) => {
              let exist = false;

              this.clienteArticulosModel?.forEach(clienteArticulo => {
                if (clienteArticulo?.articulo?.id == articulo.id) {
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

        if (this.clienteArticuloModel != null) {
          this.loadEdit(this.clienteArticuloModel);
          this.f['selectedArticle'].disable();
        }
      },
      error: (e) => {
      }
    });
  }

  onOptionSelected(partNumber: string) {
    try {
      this.selectedArticle = this.getArticuloByPartNumber(partNumber);
      if (this.selectedArticle != undefined) {
        if (this.selectedArticle.photo)
          this.imageUrl = `${environment.apiUrl}/images/articulos/${this.selectedArticle.photo}`;

        this.form.patchValue({
          precio_cliente: this.isEditing ? this.clienteArticuloModel?.precio : this.selectedArticle.precio_venta
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
      if (this.form!.invalid == false && this.isTotalConDescuentoValid()) {
        let clienteArticuloModel = new ClienteArticuloModel();
        clienteArticuloModel.precio = this.f['precio_cliente'].value;
        clienteArticuloModel.descuento = this.f['descuento'].value;
        clienteArticuloModel.comentarios = this.f['comentarios'].value;
        clienteArticuloModel.articulo = this.selectedArticle;
        this.add.emit(clienteArticuloModel);
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

  calcularTotalConDescuento(): string {
    const precio = this.form.get('precio_cliente')?.value || 0;
    const descuento = this.form.get('descuento')?.value || 0;
    const total = precio - descuento;
    return total.toFixed(2); // Mostrar solo 2 decimales
  }

  isTotalConDescuentoValid(): boolean {
    const precio = this.form.get('precio_cliente')?.value || 0;
    const descuento = this.form.get('descuento')?.value || 0;
    return precio >= descuento;
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
