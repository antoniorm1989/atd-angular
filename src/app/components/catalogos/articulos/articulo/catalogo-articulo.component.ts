import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { Observable } from 'rxjs';
import { MessageComponent } from 'src/app/components/genericos/snack-message.component';
import { CatalogoArticuloModel } from 'src/app/models/catalogo-articulo.model';
import { CatalogoCategoriaArticuloModel } from 'src/app/models/catalogo-categoria-articulo.model';
import { User } from 'src/app/models/user';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { CatalogoCategoriaArticuloService } from 'src/app/services/catalogo-categoria-articulos.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-articulo',
  templateUrl: './catalogo-articulo.component.html',
  styleUrls: ['./catalogo-articulo.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatalogoArticuloComponent {

  action: string = 'view';
  title: string = '';
  form: FormGroup;
  submitted = false;
  id = 0;
  categories!: CatalogoCategoriaArticuloModel[];

  selectedFile: File | null = null;
  imageUrl: string | null = null;
  isPartNumberDuplicate: boolean = false;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private catalogoArticuloService: CatalogoArticuloService, private router: Router, private catalogoCategoriaArticuloService: CatalogoCategoriaArticuloService, private _snackBar: MatSnackBar) {

    this.form = this.formBuilder.group({
      part_number: ['', [Validators.required]],
      description: ['', [Validators.required]],
      comment: '',
      precio_venta: ['', [Validators.required]],
      cost: '',
      category: '',
      show_admin_users: '',
      status: true,
      created_at: '',
      selectedCategory: [null, Validators.required],
      photo: null,
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url.includes('/almacenes/catalogos/articulos/detail')) {

        this.route.params.subscribe(params => {
          this.id = params['id'];
          if (this.id != undefined) {
            this.catalogoArticuloService.getById(this.id).subscribe({
              next: (data) => {

                var articulo = data;

                this.form.patchValue({
                  part_number: data.part_number,
                  description: data.description,
                  comment: data.comment,
                  precio_venta: data.precio_venta,
                  cost: data.cost,
                  show_admin_users: data.show_admin_users,
                  status: data.status,
                  created_at: data.created_at,
                  selectedCategory: [null, Validators.required],
                });

                if (data.photo)
                  this.imageUrl = `${environment.apiUrl}/images/articulos/${data.photo}`;

                this.route.queryParams.subscribe(params => {
                  switch (params['action']) {
                    case undefined:
                      this.action = 'view';
                      this.title = 'Consultar artículo';
                      this.form.disable();
                      break;
                    case 'edit':
                      this.action = 'edit';
                      this.title = 'Editar artículo';
                      break;
                  }
                });

                this.catalogoCategoriaArticuloService.getAll().subscribe({
                  next: (data) => {
                    if (data.length > 0) {
                      this.categories = data;
                      var category = data.filter(c => c.id == articulo.cat_articulo_id)
                      if (category.length > 0)
                        this.f['selectedCategory'].setValue(category[0]);
                    }
                  },
                  error: (e) => {
                  }
                });

              },
              error: (e) => {
              }
            });
          } else {
            this.action = 'new';
            this.title = 'Agregar artículo';
            this.catalogoCategoriaArticuloService.getAll().subscribe({
              next: (data) => {
                if (data.length > 0) {
                  this.categories = data;
                }
              },
              error: (e) => {
              }
            });
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
    this.isPartNumberDuplicate = false;

    // stop here if form is invalid
    if (this.form!.invalid)
      return;

    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
    let user = new User();
    user.id = userData.id;

    let articulo = new CatalogoArticuloModel();
    articulo.id = this.id;
    articulo.part_number = this.f['part_number'].value;
    articulo.description = this.f['description'].value;
    articulo.comment = this.f['comment'].value;
    articulo.precio_venta = this.f['precio_venta'].value;
    articulo.cost = this.f['cost'].value;
    articulo.photo = '';
    articulo.show_admin_users = this.f['show_admin_users'].value == true;
    articulo.status = this.f['status'].value || '0';
    articulo.user = user;
    articulo.cat_articulo_id = this.f['selectedCategory'].value.id;

    if (this.action == 'new') {
      this.catalogoArticuloService.create(articulo).subscribe({
        next: (data) => {
          if (this.selectedFile != null)
            this.uploadPhoto(data.id).subscribe({
              next: () => {
                this.openMessageSnack();
                this.router.navigate(['almacenes/catalogos/articulos']);
              },
              error: (e) => {
                console.log(e);
              }
            });
          else {
            this.openMessageSnack();
            this.router.navigate(['almacenes/catalogos/articulos']);
          }
        },
        error: (e) => {
          if (e.error.error == 'Part number already exists')
            this.isPartNumberDuplicate = true;

          console.log(e);
        }
      });
    } else {
      this.catalogoArticuloService.update(articulo).subscribe({
        next: (data) => {
          if (this.selectedFile != null)
            this.uploadPhoto(data.id).subscribe({
              next: () => {
                this.openMessageSnack();
                this.router.navigate(['almacenes/catalogos/articulos']);
              },
              error: (e) => {
                console.log(e);
              }
            });
          else {
            this.openMessageSnack();
            this.router.navigate(['almacenes/catalogos/articulos']);
          }
        },
        error: (e) => {
          if (e.error.error == 'Part number already exists')
            this.isPartNumberDuplicate = true;

          console.log(e);
        }
      });
    }
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

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];

    // Display a preview of the selected image
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (reader.readyState === FileReader.DONE) {
        this.imageUrl = e.target.result;
      }
    };

    if (this.selectedFile) {
      reader.readAsDataURL(this.selectedFile);
    }
  }


  uploadPhoto(id: number): Observable<void> {
    const formData = new FormData();
    formData.append('photo', this.selectedFile!);
    return this.catalogoArticuloService.uploadPhoto(id, formData);
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

  formatearComoMoneda(valor: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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

}
