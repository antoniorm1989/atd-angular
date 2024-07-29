import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { MessageComponent } from 'src/app/components/genericos/snack-message.component';
import { CatalogoProveedorModel } from 'src/app/models/catalogo-proveedor.model';
import { CatalogoCityModel, CatalogoCountryModel, CatalogoRegimenFiscalModel, CatalogoStateModel } from 'src/app/models/catalogos.model';
import { User } from 'src/app/models/user';
import { CatalogoProveedoresService } from 'src/app/services/catalogo-proveedor.service';
import { CatalogosService } from 'src/app/services/catalogos.service';

@Component({
  selector: 'app-catalogo-proveedores',
  templateUrl: './catalogo-proveedores.component.html',
  styleUrls: ['./catalogo-proveedores.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatalogoProveedoresComponent {

  action: string = 'view';
  title: string = '';
  form: FormGroup;
  submitted = false;

  states: CatalogoStateModel[] = [];
  selectedState!: CatalogoStateModel;

  cities: CatalogoCityModel[] = [];
  selectedCity!: CatalogoCityModel;

  regimenesFiscales: CatalogoRegimenFiscalModel[] = [];
  selectedRegimenFiscal!: CatalogoRegimenFiscalModel;

  id = 0;

  isRfcDuplicate: boolean = false;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private catalogosService: CatalogosService, private router: Router, private _snackBar: MatSnackBar, private catalogoProveedoresService: CatalogoProveedoresService) {

    this.form = this.formBuilder.group({
      proveedor: ['', [Validators.required]],
      nombreContacto: [''],
      apellidoContacto: [''],
      tiempoEstimadoEntrega: [''],
      unidadTiempo: [''],
      celular: [''],
      telefono: [''],
      cuentaBancaria: [''],
      rfc: ['', [Validators.required]],
      descripcion: [''],
      correo: ['', [Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')]],
      state: [''],
      city: ['',],
      calle: [''],
      colonia: [''],
      numero_exterior: [''],
      numero_interior: [''],
      cp: [''],
      status: ['true']
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {

        this.route.params.subscribe(params => {
          this.id = params['id'];
          if (this.id != undefined) {
            this.catalogoProveedoresService.getById(this.id).subscribe({
              next: (data) => {

                this.form.patchValue({
                  proveedor: data.proveedor,
                  nombreContacto: data.nombreContacto,
                  apellidoContacto: data.apellidoContacto,
                  tiempoEstimadoEntrega: data.tiempoEstimadoEntrega,
                  unidadTiempo: data.unidadTiempo,
                  celular: data.celular,
                  telefono: data.telefono,
                  cuentaBancaria: data.cuentaBancaria,
                  rfc: data.rfc,
                  descripcion: data.descripcion,
                  correo: data.correo,
                  calle: data.calle,
                  colonia: data.colonia,
                  numero_exterior: data.numero_exterior,
                  numero_interior: data.numero_interior,
                  cp: data.cp,
                  status: data.status
                });

                this.catalogosService.getStatesByCountry("MEX").subscribe({
                  next: (dataStates) => {
                    this.states = dataStates;
                    this.selectedState = dataStates.filter(function (state) {
                      return data.state && data.state.id == state.id;
                    })[0];

                    if (this.selectedState && this.selectedState.key) {
                      this.form.patchValue({
                        state: this.selectedState
                      });

                      this.catalogosService.getCitiesByState(this.selectedState.key).subscribe({
                        next: (dataCities) => {
                          this.cities = dataCities;
                          this.selectedCity = dataCities.filter(function (city) {
                            return data.city && data.city.id == city.id;
                          })[0];

                          if (this.selectedCity.id)
                            this.form.patchValue({
                              city: this.selectedCity
                            });

                        },
                        error: (e) => {
                          console.log(e);
                        }
                      });
                    }
                  },
                  error: (e) => {
                    console.log(e);
                  }
                });

                this.route.queryParams.subscribe(params => {
                  switch (params['action']) {
                    case undefined:
                      this.action = 'view';
                      this.title = 'Consultar proveedor';
                      this.form.disable();
                      break;
                    case 'edit':
                      this.action = 'edit';
                      this.title = 'Editar proveedor';
                      break;
                  }
                });
              },
              error: (e) => {
                console.log(e);
              }
            });
          } else {
            this.action = 'new';
            this.title = 'Agregar proveedor';

            this.catalogosService.getStatesByCountry("MEX").subscribe({
              next: (dataStates) => {
                this.states = dataStates;
              },
              error: (e) => {
                console.log(e);
              }
            });


            this.catalogosService.getRegimenensFiscales().subscribe({
              next: (data) => {
                this.regimenesFiscales = data;
              },
              error: (e) => {
                console.log(e);
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

  onStateChange(event: any) {
    this.catalogosService.getCitiesByState(this.selectedState.key ?? '').subscribe({
      next: (data) => {
        this.cities = data;
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    this.isRfcDuplicate = false;

    // stop here if form is invalid
    if (this.form!.invalid)
      return;

    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","lastname":""}');
    let user = new User();
    user.id = userData.id;

    let proveedor = new CatalogoProveedorModel();
    proveedor.id = this.id;
    proveedor.proveedor = this.f['proveedor'].value;
    proveedor.nombreContacto = this.f['nombreContacto'].value;
    proveedor.apellidoContacto = this.f['apellidoContacto'].value;
    proveedor.tiempoEstimadoEntrega = this.f['tiempoEstimadoEntrega'].value;
    proveedor.unidadTiempo = this.f['unidadTiempo'].value;
    proveedor.celular = this.f['celular'].value;
    proveedor.telefono = this.f['telefono'].value;
    proveedor.cuentaBancaria = this.f['cuentaBancaria'].value;
    proveedor.rfc = this.f['rfc'].value;
    proveedor.descripcion = this.f['descripcion'].value;
    proveedor.correo = this.f['correo'].value;
    proveedor.state = this.selectedState;
    proveedor.city = this.selectedCity;
    proveedor.calle = this.f['calle'].value;
    proveedor.colonia = this.f['colonia'].value;
    proveedor.numero_exterior = this.f['numero_exterior'].value;
    proveedor.numero_interior = this.f['numero_interior'].value;
    proveedor.cp = this.f['cp'].value;
    proveedor.status = this.f['status'].value || '0';
    proveedor.user = user;

    if (this.action == 'new') {
      this.catalogoProveedoresService.create(proveedor).subscribe({
        next: (data) => {
          this.openMessageSnack();
          this.router.navigate(['catalogos/proveedores']);
        },
        error: (e) => {
          if (e.error.error == 'Ya existe un proveedor registrado con el mismo RFC')
            this.isRfcDuplicate = true;

          console.log(e);
        }
      });
    } else {
      this.catalogoProveedoresService.update(proveedor).subscribe({
        next: (data) => {
          this.openMessageSnack();
          this.router.navigate(['catalogos/proveedores']);
        },
        error: (e) => {
          if (e.error.error == 'Ya existe un proveedor registrado con el mismo RFC')
            this.isRfcDuplicate = true;

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
    this.title = 'Editar proveedor';
    this.form.enable();
  }

  getStateByKey(key: string): string {
    let state = this.states.filter(s => s.key == key);
    return state.length > 0 ? state[0].name ?? '' : '';
  }

  getCityById(id: string): string {
    let city = this.cities.filter(s => s.id == id);
    return city.length > 0 ? city[0].name ?? '' : '';
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
