import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { CatalogoSucursalModel } from 'src/app/models/catalogo-sucursal.model';
import { CatalogoCityModel, CatalogoStateModel } from 'src/app/models/catalogos.model';
import { User } from 'src/app/models/user';
import { CatalogoSucursalesService } from 'src/app/services/catalogo-sucursales.service';
import { CatalogosService } from 'src/app/services/catalogos.service';

@Component({
  selector: 'app-catalogo-sucursales',
  templateUrl: './catalogo-sucursales.component.html',
  styleUrls: ['./catalogo-sucursales.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatalogoSucursalesComponent implements OnInit {

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

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private catalogosService: CatalogosService, private catalogoSucursalesService: CatalogoSucursalesService, private router: Router) {

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
      state_key: ['']
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {

        this.route.params.subscribe(params => {
          this.id = params['id'];
          if (this.id != undefined) {
            this.catalogoSucursalesService.getById(this.id).subscribe({
              next: (data) => {
                this.route.queryParams.subscribe(params => {
                  switch (params['action']) {
                    case undefined:
                      this.action = 'view';
                      this.title = 'Ver sucursal';
                      break;
                    case 'edit':
                      this.action = 'edit';
                      this.title = 'Editar sucursal';

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
                        city_key: [data.city_key]
                      });

                      if (data.state_key)
                        this.catalogosService.getCitiesByState(data.state_key).subscribe({
                          next: (data) => {
                            this.cities = data;
                          },
                          error: (e) => {
                          }
                        });
                      break;
                  }
                });
              },
              error: (e) => {
              }
            });
          } else {
            this.action = 'new';
            this.title = 'Agregar sucursal';
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

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      switch (params['action']) {
        case 'new':
          this.action = 'new';
          this.title = 'Agregar sucursal';
          break;
        case 'edit':
          this.action = 'edit';
          this.title = 'Editar sucursal';
          break;
        case 'view':
          this.action = 'view';
          this.title = 'Ver sucursal';
          break;
      }
    });
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

    let sucursal = new CatalogoSucursalModel();
    sucursal.id = this.id;
    sucursal.name = this.f['name'].value;
    sucursal.description = this.f['description'].value;
    sucursal.phone = this.f['phone'].value;
    sucursal.street = this.f['street'].value;
    sucursal.neighborhood = this.f['neighborhood'].value;
    sucursal.external_number = this.f['external_number'].value;
    sucursal.internal_number = this.f['internal_number'].value;
    sucursal.postal_code = this.f['postal_code'].value;
    sucursal.show_admin_users = this.f['show_admin_users'].value == true;
    sucursal.status = this.f['status'].value;
    sucursal.city_key = this.f['city_key'].value || null;
    sucursal.user = user;

    if (this.action == 'new') {
      this.catalogoSucursalesService.create(sucursal).subscribe({
        next: (data) => {
          this.router.navigate(['catalogos/sucursales']);
        },
        error: (e) => {
        }
      });
    } else {
      this.catalogoSucursalesService.update(sucursal).subscribe({
        next: (data) => {
          this.router.navigate(['catalogos/sucursales']);
        },
        error: (e) => {
        }
      });
    }
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }
}
