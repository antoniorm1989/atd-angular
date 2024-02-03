import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageComponent } from 'src/app/components/genericos/snack-message.component';
import { User } from 'src/app/models/user';
import { InventoryAlmacenService } from 'src/app/services/inventory.service';
import { CatalogoAlmacenesService } from 'src/app/services/catalogo-almacenes.service';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { ArticuloGroup, CatalogoArticuloModel } from 'src/app/models/catalogo-articulo.model';
import { CatalogoAlmacenModel } from 'src/app/models/catalogo-almacen.model';
import { environment } from 'src/environments/environment';
import { InventoryAlmacenModel, InventoryAlmacenTransactionsModel } from 'src/app/models/inventory-almacen.model';
import { Observable, map, startWith } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BarcodeScannerComponent } from '../../genericos/barcodesScanner.component';


export const _filter = (opt: CatalogoArticuloModel[], value: string): CatalogoArticuloModel[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.part_number!.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'app-entrada-almacen',
  templateUrl: './entrada-almacen.component.html',
  styleUrls: ['./entrada-almacen.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class EntradaAlmacenComponent implements OnInit, OnDestroy {

  action: string = 'new';
  form: FormGroup;
  submitted = false;
  almacen: CatalogoAlmacenModel | null = null;
  stock: number | undefined = 0;
  imageUrl: string | null = null;
  selectedArticle: CatalogoArticuloModel | undefined = undefined;

  articuloGroups: ArticuloGroup[] = [];
  articuloGroupOptions!: Observable<ArticuloGroup[]>;
  @ViewChild('selectedArticleInput', { static: false }) selectedArticleInput: ElementRef | undefined;

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private inventoryAlmacenService:
      InventoryAlmacenService,
    private catalogoAlmacenesService: CatalogoAlmacenesService,
    private router: Router,
    private catalogoArticuloService: CatalogoArticuloService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog) {
    this.form = this.formBuilder.group({
      id: [0, [Validators.required]],
      selectedArticle: [null, Validators.required],
      minimum_stock: [null],
      maximum_stock: [null],
      notify_stock: [true, [Validators.required]],
      qty: [null, []],
      comment: ['', []],
    });

    try {
      this.addMinValidator();
      this.addMaxValidator();
      this.addMaxMinValidator('qty');
    } catch (error) {
      console.error('An error occurred in constructor:', error);
    }
  }

  ngOnInit() {
    try {
      const almacenId = this.route.snapshot.paramMap.get('almacenId');

      if (almacenId != undefined) {
        this.almacen = new CatalogoAlmacenModel(parseInt(almacenId));
        this.catalogoAlmacenesService.getById(parseInt(almacenId)).subscribe({
          next: (data) => {
            this.almacen = data;
          },
          error: (e) => {
          }
        });

        var articuloId = this.route.snapshot.paramMap.get('articuloId');
        if (articuloId != undefined) {
          this.inventoryAlmacenService.getInventoryByAlmacenByArticulo(parseInt(almacenId), parseInt(articuloId)).subscribe({
            next: (data) => {
              if (data) {
                if (data.inventory_transaction && data.inventory_transaction.length > 0) {
                  this.stock = data.inventory_transaction[0]?.stock;
                }

                this.form.patchValue({
                  id: data.id,
                  minimum_stock: data.minimum_stock,
                  maximum_stock: data.maximum_stock,
                  notify_stock: data.notify_stock,
                  qty: 0
                });
              }
            }
          });

          this.catalogoArticuloService.getById(parseInt(articuloId)).subscribe({
            next: (data) => {
              var articulo = data;

              if (articulo.photo)
                this.imageUrl = `${environment.apiUrl}images/articulos/${articulo.photo}`;
            }
          });
        }

        this.catalogoArticuloService.getAllGroupedByCategory().subscribe({
          next: (data) => {
            this.articuloGroups = data;
            this.articuloGroupOptions = this.form.get('selectedArticle')!.valueChanges.pipe(
              startWith(''),
              map(value => this._filterGroup(value || '')),
            );

            if (articuloId != null) {
              this.f['selectedArticle'].setValue(this.getArticuloById(parseInt(articuloId || '0'))?.part_number);
              this.f['selectedArticle'].disable();
            } else {
              if (this.selectedArticleInput && this.selectedArticleInput.nativeElement) {
                this.selectedArticleInput.nativeElement.focus();
              }
            }
          },
          error: (e) => {
          }
        });

        this.form.controls['selectedArticle'].valueChanges.subscribe((newValue) => {
          this.onOptionSelected(newValue);
        });

      }
    } catch (error) {
      console.error('An error occurred in ngOnInit:', error);
    }
  }

  ngOnDestroy() {
    this.clearAutocompleteInput();
  }

  get f() { return this.form!.controls; }

  getUrlPhoto(articulo: CatalogoArticuloModel): string {
    try {
      return articulo.photo != '' ? `${environment.apiUrl}images/articulos/${articulo.photo}` : '../../assets/images/empty-image.png';
    } catch (error) {
      console.error('An error occurred in getUrlPhoto:', error);
      return "../../assets/images/empty-image.png";
    }
  }


  onOptionSelected(partNumber: string) {
    try {
      this.selectedArticle = this.getArticuloByPartNumber(partNumber);
      if (this.selectedArticle != undefined) {
        if (this.selectedArticle.photo)
          this.imageUrl = `${environment.apiUrl}images/articulos/${this.selectedArticle.photo}`;

        this.inventoryAlmacenService.getInventoryByAlmacenByArticulo(this.almacen?.id, this.selectedArticle.id).subscribe({
          next: (data) => {
            if (data && data.id) {
              if (data.inventory_transaction && data.inventory_transaction.length > 0) {
                this.stock = data.inventory_transaction[0]?.stock;
              } else
                this.stock = 0;

              this.form.patchValue({
                id: data.id,
                minimum_stock: data.minimum_stock,
                maximum_stock: data.maximum_stock,
                notify_stock: data.notify_stock,
                qty: 0
              });

            } else {
              this.stock = 0;

              this.form.patchValue({
                id: 0,
                minimum_stock: 0,
                maximum_stock: 0,
                notify_stock: false,
                qty: 0,
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('An error occurred in onOptionSelected:', error);
    }
  }

  onSubmit() {
    try {
      this.submitted = true;

      // stop here if form is invalid
      if (this.form!.invalid)
        return;

      let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","lastname":""}');
      let user = new User();
      user.user_id = userData.user_id;

      let inventoryAlmacen = new InventoryAlmacenModel();
      inventoryAlmacen.id = this.f['id'].value;
      inventoryAlmacen.almacen = new CatalogoAlmacenModel(this.almacen?.id || 0);
      inventoryAlmacen.articulo = new CatalogoArticuloModel(this.selectedArticle?.id || 0);
      inventoryAlmacen.minimum_stock = this.f['minimum_stock'].value;
      inventoryAlmacen.maximum_stock = this.f['maximum_stock'].value;
      inventoryAlmacen.notify_stock = this.f['notify_stock'].value;

      if (this.f['qty'].value != 0) {
        inventoryAlmacen.inventory_transaction = [
          new InventoryAlmacenTransactionsModel(1, this.f['qty'].value, this.f['comment'].value, user)
        ];
      }

      this.inventoryAlmacenService.createOrUpdate(inventoryAlmacen).subscribe({
        next: (data) => {
          this.openMessageSnack();
          this.router.navigate(['inventario-almacen']);
        }
      });
    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }

  navigate(route: string) {
    try {
      this.router.navigate([route]);
    } catch (error) {
      console.error('An error occurred in navigate:', error);
    }
  }

  openMessageSnack() {
    try {
      const config: MatSnackBarConfig = {
        duration: 5000,
        data: {
          html: '✅ <b>¡En hora buena!</b><br/> La acción se ha realizado con éxito',
        },
      };
      this._snackBar.openFromComponent(MessageComponent, config);
    } catch (error) {
      console.error('An error occurred in openMessageSnack:', error);
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

  onMinimumStockChange() {
    try {
      this.addMaxValidator();
    } catch (error) {
      console.error('An error occurred in onMinimumStockChange:', error);
    }
  }

  onMaximumStockChange() {
    try {
      this.addMinValidator();
    } catch (error) {
      console.error('An error occurred in onMaximumStockChange:', error);
    }
  }

  handleScannedValue(value: string) {
    try {
      this.f['selectedArticle'].setValue(value);
    } catch (error) {
      console.error('An error occurred in handleScannedValue:', error);
    }
  }

  private addMaxMinValidator(property: string) {
    try {
      // Create a custom validator function
      const qtyValidator: ValidatorFn = (control: AbstractControl) => {
        if (this.getStock() !== undefined && this.getStock() < 0) {
          return { isStockNeg: true };
        }
        return null;
      };

      const formControl = this.f[property];
      formControl.clearValidators();
      formControl.setValidators([qtyValidator]);
      formControl.updateValueAndValidity();
    } catch (error) {
      console.error('An error occurred in addMaxMinValidator:', error);
    }
  }

  private addMaxValidator() {
    try {
      // Create a custom validator function
      const maxValidator: ValidatorFn = (control: AbstractControl) => {

        const minStock = this.f['minimum_stock'].value;
        const maxStock = this.f['maximum_stock'].value;

        if (minStock !== null && maxStock !== null && maxStock < minStock) {
          return { maxLessThanMin: true };
        } else if (maxStock < 0 || maxStock == 0) {
          return { lessThanZero: true };
        } else if (maxStock == null)
          return { undefined: true };

        return null;
      };

      const formControl = this.f['maximum_stock'];
      formControl.clearValidators();
      formControl.setValidators([maxValidator]);
      formControl.updateValueAndValidity();
    } catch (error) {
      console.error('An error occurred in addMaxValidator:', error);
    }
  }

  private addMinValidator() {
    try {
      // Create a custom validator function
      const minValidator: ValidatorFn = (control: AbstractControl) => {

        const minStock = this.f['minimum_stock'].value;
        const maxStock = this.f['maximum_stock'].value;

        if (minStock !== null && maxStock !== null && minStock > maxStock) {
          return { minGreaterThanMax: true };
        } else if (minStock < 0 || minStock == 0) {
          return { lessThanZero: true };
        } else if (minStock == null)
          return { undefined: true };

        return null;
      };

      const formControl = this.f['minimum_stock'];
      formControl.clearValidators();
      formControl.setValidators([minValidator]);
      formControl.updateValueAndValidity();
    } catch (error) {
      console.error('An error occurred in addMinValidator:', error);
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

  getArticuloById(id: number | null): CatalogoArticuloModel | undefined {
    try {
      for (const group of this.articuloGroups) {
        const foundArticulo = group.articulos!.find(articulo => articulo.id === id);
        if (foundArticulo) {
          return foundArticulo;
        }
      }
      return undefined;
    } catch (error) {
      console.error('An error occurred in getArticuloById:', error);
      return undefined;
    }
  }

  clearAutocompleteInput() {
    try {
      this.f['selectedArticle'].reset();
    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  agregarQty() {
    try {
      this.f['qty'].setValue(this.f['qty'].value + 1);
    } catch (error) {
      console.error('An error occurred in agregarQty:', error);
    }
  }

  restarQty() {
    try {
      this.f['qty'].setValue(this.f['qty'].value - 1);
    } catch (error) {
      console.error('An error occurred in restarQty:', error);
    }
  }

  openDialogEscanner() {
    const dialogRef = this.dialog.open(DialogEscannerComponent, {
      data: {
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result)
        this.f['selectedArticle'].setValue(result);
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
  selector: 'dialog-component',
  template: `<h2 mat-dialog-title>Escanear codigo de barras</h2>
            <mat-dialog-content class="mat-typography">
              <app-barcode-scanner #appBarcodeScanner (scannedValue)="handleScannedValue($event)"></app-barcode-scanner>
            </mat-dialog-content>
            <mat-dialog-actions align="end">
              <button mat-button mat-dialog-close>Cancel</button>
            </mat-dialog-actions>`,
  styles: [`
    .cdk-overlay-pane {
      width: 90vw;
    }
  `],
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
