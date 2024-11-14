import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { MessageComponent } from 'src/app/components/genericos/snack-message.component';
import { CatalogoCategoriaArticuloModel } from 'src/app/models/catalogo-categoria-articulo.model';
import { User } from 'src/app/models/user';
import { CatalogoCategoriaArticuloService } from 'src/app/services/catalogo-categoria-articulos.service';

@Component({
  selector: 'app-catalogo-articulo',
  templateUrl: './catalogo-categoria-articulo.component.html',
  styleUrls: ['./catalogo-categoria-articulo.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatalogoCategoriaArticuloComponent {

  action: string = 'view';
  title: string = '';
  form: FormGroup;
  submitted = false;
  id = 0;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private CatalogoCategoriaArticuloService: CatalogoCategoriaArticuloService, private router: Router, private _snackBar: MatSnackBar) {

    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [''],
      show_admin_users: [''],
      status: [''],
      created_at: ['created_at']
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url.includes('/catalogos/categoria-articulos/detail')) {

        this.route.params.subscribe(params => {
          this.id = params['id'];
          if (this.id != undefined) {
            this.CatalogoCategoriaArticuloService.getById(this.id).subscribe({
              next: (data) => {

                this.form.patchValue({
                  name: [data.name],
                  description: [data.description],
                  show_admin_users: [data.show_admin_users],
                  status: [data.status],
                  created_at: [data.created_at]
                });

                this.route.queryParams.subscribe(params => {
                  switch (params['action']) {
                    case undefined:
                      this.action = 'view';
                      this.title = 'Consultar categoría';
                      this.form.disable();
                      break;
                    case 'edit':
                      this.action = 'edit';
                      this.title = 'Editar categoría';
                      break;
                  }
                });
              },
              error: (e) => {
              }
            });
          } else {
            this.action = 'new';
            this.title = 'Agregar categoría';
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
    user.id = userData.id;

    let articulo = new CatalogoCategoriaArticuloModel();
    articulo.id = this.id;
    articulo.name = this.f['name'].value;
    articulo.description = this.f['description'].value;
    articulo.show_admin_users = this.f['show_admin_users'].value == true;
    articulo.status = this.f['status'].value || '0';
    articulo.user = user;

    if (this.action == 'new') {
      this.CatalogoCategoriaArticuloService.create(articulo).subscribe({
        next: (data) => {
          this.openMessageSnack();
          this.router.navigate(['almacenes/catalogos/categoria-articulos']);
        },
        error: (e) => {
        }
      });
    } else {
      this.CatalogoCategoriaArticuloService.update(articulo).subscribe({
        next: (data) => {
          this.openMessageSnack();
          this.router.navigate(['almacenes/catalogos/categoria-articulos']);
        },
        error: (e) => {
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
    this.title = 'Editar categoría';
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
}
