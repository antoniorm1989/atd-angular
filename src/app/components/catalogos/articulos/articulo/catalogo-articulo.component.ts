import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { CatalogoArticuloModel } from 'src/app/models/catalogo-articulo.model';
import { User } from 'src/app/models/user';
import { CatalogoArticulosService } from 'src/app/services/catalogo-articulos.service';

@Component({
  selector: 'app-catalogo-articulo',
  templateUrl: './catalogo-articulo.component.html',
  styleUrls: ['./catalogo-articulo.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatalogoArticulosComponent {

  action: string = 'view';
  title: string = '';
  form: FormGroup;
  submitted = false;
  id = 0;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private catalogoArticulosService: CatalogoArticulosService, private router: Router) {

    this.form = this.formBuilder.group({
      name: [''],
      description: [''],
      show_admin_users: [''],
      status: [''],
      created_at: ['created_at']
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url.includes('/catalogos/articulos/detail')) {

        this.route.params.subscribe(params => {
          this.id = params['id'];
          if (this.id != undefined) {
            this.catalogoArticulosService.getById(this.id).subscribe({
              next: (data) => {

                this.form = this.formBuilder.group({
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
                      this.title = 'Consultar articulo';
                      this.form.disable();
                      break;
                    case 'edit':
                      this.action = 'edit';
                      this.title = 'Editar articulo';
                      break;
                  }
                });
              },
              error: (e) => {
              }
            });
          } else {
            this.action = 'new';
            this.title = 'Agregar articulo';
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
    articulo.name = this.f['name'].value;
    articulo.description = this.f['description'].value;
    articulo.show_admin_users = this.f['show_admin_users'].value == true;
    articulo.status = this.f['status'].value || '0';
    articulo.user = user;

    if (this.action == 'new') {
      this.catalogoArticulosService.create(articulo).subscribe({
        next: (data) => {
          this.router.navigate(['catalogos/articulos']);
        },
        error: (e) => {
        }
      });
    } else {
      this.catalogoArticulosService.update(articulo).subscribe({
        next: (data) => {
          this.router.navigate(['catalogos/articulos']);
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
    this.title = 'Editar articulo';
    this.form.enable();
  }
}
