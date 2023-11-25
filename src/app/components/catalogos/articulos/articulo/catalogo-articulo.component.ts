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

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private catalogoArticuloService: CatalogoArticuloService, private router: Router, private catalogoCategoriaArticuloService: CatalogoCategoriaArticuloService, private _snackBar: MatSnackBar) {

    this.form = this.formBuilder.group({
      part_number: ['', [Validators.required]],
      description: ['', [Validators.required]],
      comment: [''],
      cost: [''],
      category: [''],
      show_admin_users: [''],
      status: [''],
      created_at: ['created_at'],
      selectedCategory: [null, Validators.required],
      photo: [null, Validators.required],
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url.includes('/catalogos/articulos/detail')) {

        this.route.params.subscribe(params => {
          this.id = params['id'];
          if (this.id != undefined) {
            this.catalogoArticuloService.getById(this.id).subscribe({
              next: (data) => {

                var articulo = data;

                this.form.patchValue({
                  part_number: [data.part_number],
                  description: [data.description],
                  comment: [data.comment],
                  cost: [data.cost],
                  show_admin_users: [data.show_admin_users],
                  status: [data.status],
                  created_at: [data.created_at],
                  selectedCategory: [null, Validators.required],
                });

                if (data.photo)
                  this.imageUrl = `${environment.apiUrl}images/articulos/${data.photo}`;

                this.route.queryParams.subscribe(params => {
                  switch (params['action']) {
                    case undefined:
                      this.action = 'view';
                      this.title = 'Consultar articulo';
                      this.form.disable();
                      break;
                    case 'edit':
                      this.action = 'edit';
                      this.title = 'Editar articulo';
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
            this.title = 'Agregar articulo';
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

    // stop here if form is invalid
    if (this.form!.invalid)
      return;

    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","lastname":""}');
    let user = new User();
    user.user_id = userData.user_id;

    let articulo = new CatalogoArticuloModel();
    articulo.id = this.id;
    articulo.part_number = this.f['part_number'].value;
    articulo.description = this.f['description'].value;
    articulo.comment = this.f['comment'].value;
    articulo.cost = this.f['cost'].value;
    articulo.photo = '';
    articulo.show_admin_users = this.f['show_admin_users'].value == true;
    articulo.status = this.f['status'].value || '0';
    articulo.user = user;
    articulo.cat_articulo_id = this.f['selectedCategory'].value.id;

    if (this.action == 'new') {
      this.catalogoArticuloService.create(articulo).subscribe({
        next: (data) => {
          this.uploadPhoto(data.id).subscribe({
            next: () => {
              this.openMessageSnack();
              this.router.navigate(['catalogos/articulos']);
            },
            error: (e) => {
              console.log(e);
            }
          });
        },
        error: (e) => {
        }
      });
    } else {
      this.catalogoArticuloService.update(articulo).subscribe({
        next: (data) => {
          this.uploadPhoto(data.id).subscribe({
            next: () => {
              this.openMessageSnack();
              this.router.navigate(['catalogos/articulos']);
            },
            error: (e) => {
              console.log(e);
            }
          });
        },
        error: (e) => {
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
      this.imageUrl = e.target.result;
    };

    if (this.selectedFile)
      reader.readAsDataURL(this.selectedFile);
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

}
