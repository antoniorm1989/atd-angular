import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { CatalogoRolModel } from 'src/app/models/catalogo-rol.model';
import { User } from 'src/app/models/user';
import { CatalogoRolesService } from 'src/app/services/catalogo-roles.service';

@Component({
  selector: 'app-catalogo-roles',
  templateUrl: './catalogo-roles.component.html',
  styleUrls: ['./catalogo-roles.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatalogoRolesComponent {

  action: string = 'view';
  title: string = '';
  form: FormGroup;
  submitted = false;
  id = 0;
  rights = {
    catalogos: {
      sucursal: {
        crearEditar: new FormControl(false),
        consultar: new FormControl(false),
        inactivar: new FormControl(false)
      },
      almacen: {
        crearEditar: new FormControl(false),
        consultar: new FormControl(false),
        inactivar: new FormControl(false)
      },
      rol: {
        crearEditar: new FormControl(false),
        consultar: new FormControl(false),
        inactivar: new FormControl(false)
      },
      usuario: {
        crearEditar: new FormControl(false),
        consultar: new FormControl(false),
        inactivar:new FormControl(false)
      }
    }
  };

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private catalogoRolesService: CatalogoRolesService, private router: Router) {

    this.form = this.formBuilder.group({
      name: [''],
      description: [''],
      show_admin_users: [''],
      status: [''],
      created_at: ['created_at']
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url.includes('/catalogos/roles/detail')) {

        this.route.params.subscribe(params => {
          this.id = params['id'];
          if (this.id != undefined) {
            this.catalogoRolesService.getById(this.id).subscribe({
              next: (data) => {

                this.form = this.formBuilder.group({
                  name: [data.name],
                  description: [data.description],
                  show_admin_users: [data.show_admin_users],
                  status: [data.status],
                  created_at: [data.created_at]
                });

                this.setRights(data.rights);

                this.route.queryParams.subscribe(params => {
                  switch (params['action']) {
                    case undefined:
                      this.action = 'view';
                      this.title = 'Consultar rol';
                      this.form.disable();
                      this.makeDisabledRights(true);

                      break;
                    case 'edit':
                      this.action = 'edit';
                      this.title = 'Editar rol';
                      this.makeDisabledRights(false);
                      break;
                  }
                });
              },
              error: (e) => {
              }
            });
          } else {
            this.action = 'new';
            this.title = 'Agregar rol';
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

    let rol = new CatalogoRolModel();
    rol.id = this.id;
    rol.name = this.f['name'].value;
    rol.description = this.f['description'].value;
    rol.rights = JSON.stringify(this.getRights());
    rol.show_admin_users = this.f['show_admin_users'].value == true;
    rol.status = this.f['status'].value || '0';
    rol.user = user;

    if (this.action == 'new') {
      this.catalogoRolesService.create(rol).subscribe({
        next: (data) => {
          this.router.navigate(['catalogos/roles']);
        },
        error: (e) => {
        }
      });
    } else {
      this.catalogoRolesService.update(rol).subscribe({
        next: (data) => {
          this.router.navigate(['catalogos/roles']);
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
    this.title = 'Editar rol';
    this.form.enable();
    this.makeDisabledRights(false);
  }

  getRights() {
    return {
      catalogos: {
        sucursal: {
          crearEditar: this.rights.catalogos.sucursal.crearEditar.getRawValue(),
          consultar: this.rights.catalogos.sucursal.consultar.getRawValue(),
          inactivar: this.rights.catalogos.sucursal.inactivar.getRawValue()
        },
        almacen: {
          crearEditar: this.rights.catalogos.almacen.crearEditar.getRawValue(),
          consultar: this.rights.catalogos.almacen.consultar.getRawValue(),
          inactivar: this.rights.catalogos.almacen.inactivar.getRawValue()
        },
        rol: {
          crearEditar: this.rights.catalogos.rol.crearEditar.getRawValue(),
          consultar: this.rights.catalogos.rol.consultar.getRawValue(),
          inactivar: this.rights.catalogos.rol.inactivar.getRawValue()
        },
        usuario: {
          crearEditar: this.rights.catalogos.usuario.crearEditar.getRawValue(),
          consultar: this.rights.catalogos.usuario.consultar.getRawValue(),
          inactivar: this.rights.catalogos.usuario.inactivar.getRawValue()
        }
      }
    };
  }

  setRights(dataString: string | undefined) {
    var data = JSON.parse(dataString || '{}');

    this.rights.catalogos.sucursal.crearEditar.setValue(data.catalogos.sucursal.crearEditar);
    this.rights.catalogos.sucursal.consultar.setValue(data.catalogos.sucursal.consultar);
    this.rights.catalogos.sucursal.inactivar.setValue(data.catalogos.sucursal.inactivar);

    this.rights.catalogos.almacen.crearEditar.setValue(data.catalogos.almacen.crearEditar);
    this.rights.catalogos.almacen.consultar.setValue(data.catalogos.almacen.consultar);
    this.rights.catalogos.almacen.inactivar.setValue(data.catalogos.almacen.inactivar);

    this.rights.catalogos.rol.crearEditar.setValue(data.catalogos.rol.crearEditar);
    this.rights.catalogos.rol.consultar.setValue(data.catalogos.rol.consultar);
    this.rights.catalogos.rol.inactivar.setValue(data.catalogos.rol.inactivar);

    this.rights.catalogos.usuario.crearEditar.setValue(data.catalogos.usuario.crearEditar);
    this.rights.catalogos.usuario.consultar.setValue(data.catalogos.usuario.consultar);
    this.rights.catalogos.usuario.inactivar.setValue(data.catalogos.usuario.inactivar);
  }

  makeDisabledRights(disabled: boolean) {
    if (disabled) {
      this.rights.catalogos.sucursal.crearEditar.disable();
      this.rights.catalogos.sucursal.consultar.disable();
      this.rights.catalogos.sucursal.inactivar.disable();

      this.rights.catalogos.almacen.crearEditar.disable();
      this.rights.catalogos.almacen.consultar.disable();
      this.rights.catalogos.almacen.inactivar.disable();

      this.rights.catalogos.rol.crearEditar.disable();
      this.rights.catalogos.rol.consultar.disable();
      this.rights.catalogos.rol.inactivar.disable();

      this.rights.catalogos.usuario.crearEditar.disable();
      this.rights.catalogos.usuario.consultar.disable();
      this.rights.catalogos.usuario.inactivar.disable();
    } else {
      this.rights.catalogos.sucursal.crearEditar.enable();
      this.rights.catalogos.sucursal.consultar.enable();
      this.rights.catalogos.sucursal.inactivar.enable();

      this.rights.catalogos.almacen.crearEditar.enable();
      this.rights.catalogos.almacen.consultar.enable();
      this.rights.catalogos.almacen.inactivar.enable();

      this.rights.catalogos.rol.crearEditar.enable();
      this.rights.catalogos.rol.consultar.enable();
      this.rights.catalogos.rol.inactivar.enable();

      this.rights.catalogos.usuario.crearEditar.enable();
      this.rights.catalogos.usuario.consultar.enable();
      this.rights.catalogos.usuario.inactivar.enable();
    }
  }

}
