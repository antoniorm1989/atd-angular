import { Component, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { MessageComponent } from 'src/app/components/genericos/snack-message.component';
import { CatalogoCategoriaArticuloModel } from 'src/app/models/catalogo-categoria-articulo.model';
import { User } from 'src/app/models/user';
import { CatalogoCategoriaArticuloService } from 'src/app/services/catalogo-categoria-articulos.service';
import { InventoryAlmacenService } from 'src/app/services/inventory.service';
import { CatalogoAlmacenesService } from 'src/app/services/catalogo-almacenes.service';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { CatalogoArticuloModel } from 'src/app/models/catalogo-articulo.model';
import { CatalogoAlmacenModel } from 'src/app/models/catalogo-almacen.model';
import { environment } from 'src/environments/environment';
import { InventoryAlmacenModel, InventoryAlmacenTransactionsModel } from 'src/app/models/inventory-almacen.model';

@Component({
  selector: 'app-entrada-almacen',
  templateUrl: './entrada-almacen.component.html',
  styleUrls: ['./entrada-almacen.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class EntradaAlmacenComponent {

  action: string = 'new';
  form: FormGroup;
  submitted = false;
  almacen: CatalogoAlmacenModel | null = null;
  stock: number | undefined = 0;

  categories!: CatalogoCategoriaArticuloModel[];
  articles!: CatalogoArticuloModel[];

  selectedCategory: CatalogoCategoriaArticuloModel | null = null;
  selectedArticle: CatalogoArticuloModel | null = null;

  selectedFile: File | null = null;
  imageUrl: string | null = null;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private inventoryAlmacenService: InventoryAlmacenService, private catalogoAlmacenesService: CatalogoAlmacenesService, private router: Router, private catalogoCategoriaArticuloService: CatalogoCategoriaArticuloService, private catalogoArticuloService: CatalogoArticuloService, private _snackBar: MatSnackBar) {



    this.form = this.formBuilder.group({
      id: [0, [Validators.required]],
      selectedCategory: [null, Validators.required],
      selectedArticle: [null, Validators.required],
      minimum_stock: [null],
      maximum_stock: [null],
      notify_stock: [false, [Validators.required]],
      qty: [null, []],
      comment: ['', []]
    });


    this.addMinValidator();
    this.addMaxValidator();
    this.addMaxMinValidator('qty');
  }

  ngOnInit() {

    const almacenId = this.route.snapshot.paramMap.get('almacenId');
    if (almacenId != undefined) {
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

              // todo calculr maximos y minoims
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

            this.catalogoCategoriaArticuloService.getAll().subscribe({
              next: (data) => {
                this.categories = data;
                var category = this.categories.filter(c => c.id == articulo.cat_articulo_id)
                if (category.length > 0) {
                  this.f['selectedCategory'].setValue(category[0]);
                  this.f['selectedCategory'].disable();
                }
              }
            });

            if (articulo.cat_articulo_id)
              this.catalogoArticuloService.getAllByCategory(articulo.cat_articulo_id).subscribe({
                next: (data) => {
                  this.articles = data;
                  var article = this.articles.filter(c => c.id == articulo!.id)
                  if (article.length > 0) {
                    this.f['selectedArticle'].setValue(article[0]);
                    this.f['selectedArticle'].disable();
                  }
                }
              });
          }
        });

      } else {
        this.catalogoCategoriaArticuloService.getAll().subscribe({
          next: (data) => {
            this.categories = data;
          }
        });
      }
    }

  }

  get f() { return this.form!.controls; }

  onSelectCategoryChange(event: any) {
    const selectedCategory = event.value;
    if (selectedCategory)
      this.catalogoArticuloService.getAllByCategory(selectedCategory.id).subscribe({
        next: (data) => {
          this.articles = data;
        }
      });
  }

  onSelectArticleChange(event: any) {
    const selectedArticle = event.value;
    if (selectedArticle.photo)
      this.imageUrl = `${environment.apiUrl}images/articulos/${selectedArticle.photo}`;

    this.inventoryAlmacenService.getInventoryByAlmacenByArticulo(this.almacen?.id, selectedArticle.id).subscribe({
      next: (data) => {
        if (data.id) {
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

  onSubmit() {
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
    inventoryAlmacen.articulo = new CatalogoArticuloModel(this.f['selectedArticle'].value.id);
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
  }

  navigate(route: string) {
    this.router.navigate([route]);
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

  getStock(): number {
    const qtyValue = this.f['qty'].value;
    const qty = qtyValue ? parseInt(qtyValue) : 0;
    return (this.stock ?? 0) + qty;
  }

  onMinimumStockChange() {
    this.addMaxValidator();
  }

  onMaximumStockChange() {
    this.addMinValidator();
  }

  private addMaxMinValidator(property: string) {
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
  }

  private addMaxValidator() {
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
  }

  private addMinValidator() {
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
  }

}
