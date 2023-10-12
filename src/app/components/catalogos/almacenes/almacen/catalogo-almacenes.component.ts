import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { CatalogoAlmacenModel } from 'src/app/models/catalogo-almacen.model';
import { CatalogoCityModel, CatalogoStateModel } from 'src/app/models/catalogos.model';
import { User } from 'src/app/models/user';
import { CatalogoAlmacenesService } from 'src/app/services/catalogo-almacenes.service';
import { CatalogosService } from 'src/app/services/catalogos.service';

@Component({
  selector: 'app-catalogo-almacenes',
  templateUrl: './catalogo-almacenes.component.html',
  styleUrls: ['./catalogo-almacenes.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatalogoAlmacenesComponent {

  action: string = 'view';
  title: string = '';
  form: FormGroup;
  submitted = false;
  states: CatalogoStateModel[] = [
  ];
  cities: CatalogoCityModel[] = [
  ];
  selectedState = '';
  id = 0;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private catalogosService: CatalogosService, private catalogoAlmacenesService: CatalogoAlmacenesService, private router: Router) {

    this.form = this.formBuilder.group({
      name: [''],
      phone: [''],
      description: [''],
      street: [''],
      neighborhood: [''],
      external_number: [''],
      internal_number: [''],
      postal_code: [''],
      show_admin_users: [''],
      status: [''],
      city_key: [''],
      state_key: [''],
      created_at: ['created_at']
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {

        this.route.params.subscribe(params => {
          this.id = params['id'];
          if (this.id != undefined) {
            this.catalogoAlmacenesService.getById(this.id).subscribe({
              next: (data) => {

                this.form = this.formBuilder.group({
                  name: [data.name],
                  phone: [data.phone],
                  description: [data.description],
                  street: [data.street],
                  neighborhood: [data.neighborhood],
                  external_number: [data.external_number],
                  internal_number: [data.internal_number],
                  postal_code: [data.postal_code],
                  show_admin_users: [data.show_admin_users],
                  status: [data.status],
                  state_key: [data.state_key],
                  city_key: [data.city_key],
                  created_at: [data.created_at]
                });

                if (data.state_key)
                  this.catalogosService.getCitiesByState(data.state_key).subscribe({
                    next: (data) => {
                      this.cities = data;
                    },
                    error: (e) => {
                    }
                  });

                this.route.queryParams.subscribe(params => {
                  switch (params['action']) {
                    case undefined:
                      this.action = 'view';
                      this.title = 'Consultar almacen';
                      this.form.disable();
                      break;
                    case 'edit':
                      this.action = 'edit';
                      this.title = 'Editar almacen';
                      break;
                  }
                });
              },
              error: (e) => {
              }
            });
          } else {
            this.action = 'new';
            this.title = 'Agregar almacen';
          }
        });


      }
    });

    this.catalogosService.getStates().subscribe({
      next: (data) => {
        this.states = data;
      },
      error: (e) => {
      }
    });

  }

  get f() { return this.form!.controls; }

  get isReadOnly() {
    return this.action == 'view';
  }


  onStateChange(event: any) {
    this.catalogosService.getCitiesByState(this.selectedState).subscribe({
      next: (data) => {
        this.cities = data;
      },
      error: (e) => {
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

    let almacen = new CatalogoAlmacenModel();
    almacen.id = this.id;
    almacen.name = this.f['name'].value;
    almacen.description = this.f['description'].value;
    almacen.phone = this.f['phone'].value;
    almacen.street = this.f['street'].value;
    almacen.neighborhood = this.f['neighborhood'].value;
    almacen.external_number = this.f['external_number'].value;
    almacen.internal_number = this.f['internal_number'].value;
    almacen.postal_code = this.f['postal_code'].value;
    almacen.show_admin_users = this.f['show_admin_users'].value == true;
    almacen.status = this.f['status'].value || '0';
    almacen.city_key = this.f['city_key'].value || null;
    almacen.state_key = this.f['state_key'].value || null;
    almacen.user = user;

    if (this.action == 'new') {
      this.catalogoAlmacenesService.create(almacen).subscribe({
        next: (data) => {
          this.router.navigate(['catalogos/almacenes']);
        },
        error: (e) => {
        }
      });
    } else {
      this.catalogoAlmacenesService.update(almacen).subscribe({
        next: (data) => {
          this.router.navigate(['catalogos/almacenes']);
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

  makeEditMode(){
    this.action = 'edit';
    this.title = 'Editar almacen';
    this.form.enable();
  }

  getStateByKey(key: string): string{
    let state = this.states.filter(s => s.key == key);
    return state.length > 0 ? state[0].name : '';
  }

  getCityByKey(key: string): string{
    let city = this.cities.filter(s => s.key == key);
    return city.length > 0 ? city[0].name : '';
  }
}
