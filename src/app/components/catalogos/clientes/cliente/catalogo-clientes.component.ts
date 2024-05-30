import { Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { MessageComponent } from 'src/app/components/genericos/snack-message.component';
import { CatalogoClienteModel, ClienteArticuloModel } from 'src/app/models/catalogo-cliente.model';
import { CatalogoCityModel, CatalogoCountryModel, CatalogoRegimenFiscalModel, CatalogoStateModel } from 'src/app/models/catalogos.model';
import { User } from 'src/app/models/user';
import { CatalogoClientesService } from 'src/app/services/catalogo-cliente.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-catalogo-clientes',
  templateUrl: './catalogo-clientes.component.html',
  styleUrls: ['./catalogo-clientes.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatalogoClientesComponent {

  action: string = 'view';
  title: string = '';
  form: FormGroup;
  submitted = false;

  tiposClientes: string[] = ['Nacional', 'Extranjero'];
  selectedTipoCliente: string = 'Nacional';

  countries: CatalogoCountryModel[] = [];
  selectedCountry!: CatalogoCountryModel;

  states: CatalogoStateModel[] = [];
  selectedState!: CatalogoStateModel;

  cities: CatalogoCityModel[] = [];
  selectedCity!: CatalogoCityModel;

  regimenesFiscales: CatalogoRegimenFiscalModel[] = [];
  selectedRegimenFiscal!: CatalogoRegimenFiscalModel;

  id = 0;

  isRfcDuplicate: boolean = false;

  hasRecords = false;
  displayedColumns: string[] = ['numero_parte', 'descripcion', 'categoria', 'costo', 'descuento', 'actions'];
  dataSourceArticulos = new MatTableDataSource<ClienteArticuloModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private catalogosService: CatalogosService, private router: Router, private _snackBar: MatSnackBar, private catalogoClientesService: CatalogoClientesService, private dialog: MatDialog) {

    this.form = this.formBuilder.group({
      cliente: ['', [Validators.required]],
      tipoCliente: ['Nacional', [Validators.required]],
      rfc: ['', [Validators.required]],
      nombreFiscal: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')]],
      telefono: [''],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      calle: ['', [Validators.required]],
      colonia: ['', [Validators.required]],
      numero_exterior: ['', [Validators.required]],
      numero_interior: [''],
      cp: ['', [Validators.required]],
      rf: [''],
      status: ['true']
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {

        this.route.params.subscribe(params => {
          this.id = params['id'];
          if (this.id != undefined) {
            this.catalogoClientesService.getById(this.id).subscribe({
              next: (data) => {

                this.form.patchValue({
                  cliente: data.cliente,
                  tipoCliente: data.tipo,
                  rfc: data.rfc,
                  nombreFiscal: data.nombre_fiscal,
                  nombre: data.nombre,
                  correo: data.correo,
                  telefono: data.telefono,
                  calle: data.calle,
                  colonia: data.colonia,
                  numero_exterior: data.numero_exterior,
                  numero_interior: data.numero_interior,
                  cp: data.cp,
                  status: data.status
                });

                if (data.country && data.country.key) {
                  this.catalogosService.getCountries().subscribe({
                    next: (dataCountries) => {
                      this.countries = dataCountries;
                      this.selectedCountry = dataCountries.filter(function (country) {
                        return data.country && data.country.id == country.id;
                      })[0];

                      if (this.selectedCountry.key) {

                        this.form.patchValue({
                          country: this.selectedCountry
                        });

                        this.catalogosService.getStatesByCountry(this.selectedCountry.key).subscribe({
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
                      }

                    },
                    error: (e) => {
                      console.log(e);
                    }
                  });
                }

                if (data.regimen_fiscal && data.regimen_fiscal.id) {
                  this.catalogosService.getRegimenensFiscales().subscribe({
                    next: (dataRegimenesFiscales) => {
                      this.regimenesFiscales = dataRegimenesFiscales;
                      this.selectedRegimenFiscal = dataRegimenesFiscales.filter(function (regimenFiscal) {
                        return data.regimen_fiscal && data.regimen_fiscal.id == regimenFiscal.id;
                      })[0];

                      if (this.selectedRegimenFiscal.id) {
                        this.form.patchValue({
                          rf: this.selectedRegimenFiscal
                        });
                      }

                    },
                    error: (e) => {
                      console.log(e);
                    }
                  });
                }

                if (data.tipo == 'Extranjero') {
                  this.removeValidations();
                }

                this.route.queryParams.subscribe(params => {
                  switch (params['action']) {
                    case undefined:
                      this.action = 'view';
                      this.title = 'Consultar cliente';
                      this.form.disable();
                      break;
                    case 'edit':
                      this.action = 'edit';
                      this.title = 'Editar cliente';
                      break;
                  }
                });

                this.dataSourceArticulos.data = data.articulos || [];
                this.hasRecords = this.dataSourceArticulos.data.length > 0;
              },
              error: (e) => {
                console.log(e);
              }
            });
          } else {
            this.action = 'new';
            this.title = 'Agregar cliente';

            this.catalogosService.getCountries().subscribe({
              next: (data) => {
                this.countries = data;
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

  onTipoChange(event: any) {
    if (this.selectedTipoCliente == 'Extranjero') {
      this.removeValidations()
    } else {
      this.addValidations();
    }
  }

  onCountryChange(event: any) {
    this.catalogosService.getStatesByCountry(this.selectedCountry.key ?? '').subscribe({
      next: (data) => {
        this.states = data;
        this.cities = [];
      },
      error: (e) => {
        console.log(e);
      }
    });
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
    user.user_id = userData.user_id;

    let cliente = new CatalogoClienteModel();
    cliente.id = this.id;
    cliente.cliente = this.f['cliente'].value;
    cliente.tipo = this.f['tipoCliente'].value;
    cliente.rfc = this.f['rfc'].value;
    cliente.nombre_fiscal = this.f['nombreFiscal'].value;
    cliente.nombre = this.f['nombre'].value;
    cliente.correo = this.f['correo'].value;
    cliente.telefono = this.f['telefono'].value;
    cliente.country = this.f['country'].value;
    cliente.state = this.f['state'].value;
    cliente.city = this.f['city'].value;
    cliente.calle = this.f['calle'].value;
    cliente.colonia = this.f['colonia'].value;
    cliente.numero_exterior = this.f['numero_exterior'].value;
    cliente.numero_interior = this.f['numero_interior'].value;
    cliente.cp = this.f['cp'].value;
    cliente.regimen_fiscal = this.f['rf'].value;
    cliente.status = this.f['status'].value || '0';
    cliente.user = user;

    cliente.articulos = this.dataSourceArticulos.data;

    if (this.action == 'new') {
      this.catalogoClientesService.create(cliente).subscribe({
        next: (data) => {
          this.openMessageSnack();
          this.router.navigate(['catalogos/clientes']);
        },
        error: (e) => {
          if (e.error.error == 'Ya existe un cliente registrado con el mismo RFC')
            this.isRfcDuplicate = true;

          console.log(e);
        }
      });
    } else {
      this.catalogoClientesService.update(cliente).subscribe({
        next: (data) => {
          this.openMessageSnack();
          this.router.navigate(['catalogos/clientes']);
        },
        error: (e) => {
          if (e.error.error == 'Ya existe un cliente registrado con el mismo RFC')
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
    this.title = 'Editar cliente';
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

  private removeValidations() {
    this.f['country'].clearValidators();
    this.f['country'].updateValueAndValidity();

    this.f['state'].clearValidators();
    this.f['state'].updateValueAndValidity();

    this.f['city'].clearValidators();
    this.f['city'].updateValueAndValidity();

    this.f['calle'].clearValidators();
    this.f['calle'].updateValueAndValidity();

    this.f['colonia'].clearValidators();
    this.f['colonia'].updateValueAndValidity();

    this.f['numero_exterior'].clearValidators();
    this.f['numero_exterior'].updateValueAndValidity();

    this.f['cp'].clearValidators();
    this.f['cp'].updateValueAndValidity();
  }

  private addValidations() {
    this.f['country'].setValidators([Validators.required]);
    this.f['country'].updateValueAndValidity();

    this.f['state'].setValidators([Validators.required]);
    this.f['state'].updateValueAndValidity();

    this.f['city'].setValidators([Validators.required]);
    this.f['city'].updateValueAndValidity();

    this.f['calle'].setValidators([Validators.required]);
    this.f['calle'].updateValueAndValidity();

    this.f['colonia'].setValidators([Validators.required]);
    this.f['colonia'].updateValueAndValidity();

    this.f['numero_exterior'].setValidators([Validators.required]);
    this.f['numero_exterior'].updateValueAndValidity();

    this.f['cp'].setValidators([Validators.required]);
    this.f['cp'].updateValueAndValidity();
  }

  getPathPhoto(photo: string): string {
    return `${environment.apiUrl}/images/articulos/${photo}`
  }

  editArticuloModalComponent(clienteArticuloModel: ClienteArticuloModel) {
    const dialogRef = this.dialog.open(ArticuloClienteModalComponent, {
      data: {
        articulo: clienteArticuloModel
      }
    });

    dialogRef.afterClosed().subscribe(clienteArticuloModel => {
      if (clienteArticuloModel && clienteArticuloModel !== "") {
        const existingIndex = this.dataSourceArticulos.data.findIndex(item => item.articulo?.id === clienteArticuloModel.articulo?.id);
        if (existingIndex !== -1) {
          // Si existe un objeto con el mismo id, elimínalo
          this.dataSourceArticulos.data.splice(existingIndex, 1);
        }
        // Agrega el nuevo objeto
        this.dataSourceArticulos.data.push(clienteArticuloModel);
        this.dataSourceArticulos._updateChangeSubscription();
        this.hasRecords = true;
      }
    });
  }

  removeArticulo(articulo: ClienteArticuloModel) {
    const indexToRemove = this.dataSourceArticulos.data.findIndex(item => item.articulo?.id === articulo.articulo?.id);
    if (indexToRemove !== -1) {
      this.dataSourceArticulos.data.splice(indexToRemove, 1);
      this.dataSourceArticulos._updateChangeSubscription();
    }

    if (this.dataSourceArticulos.data.length == 0)
      this.hasRecords = false;
  }

  openArticuloClienteModalComponent() {
    const dialogRef = this.dialog.open(ArticuloClienteModalComponent, {
      data: {
        articulos: this.dataSourceArticulos.data
      },
    });

    dialogRef.afterClosed().subscribe(ventaArticuloModel => {
      if (ventaArticuloModel != undefined && ventaArticuloModel != "") {
        this.dataSourceArticulos.data.push(ventaArticuloModel);
        this.dataSourceArticulos._updateChangeSubscription();
        this.hasRecords = true;
      }
    });
  }
}

@Component({
  selector: 'dialog-component',
  template: `<span mat-dialog-title>Asignar artículos</span>
            <mat-dialog-content class="mat-typography">
              <app-cliente-articulo [clienteArticulosModel]="clienteArticulosModel" [clienteArticuloModel]="clienteArticuloModel" (cancel)="onCancelar()" (add)="onAgregarArticulo($event)" #appClienteArticuloComponent></app-cliente-articulo>
            </mat-dialog-content>`,
  styles: [
  ]
})
export class ArticuloClienteModalComponent {
  @ViewChild('appClienteArticuloComponent') appClienteArticuloComponent: any;
  clienteArticuloModel!: ClienteArticuloModel;
  clienteArticulosModel!: ClienteArticuloModel[];

  constructor(
    public dialogRef: MatDialogRef<ArticuloClienteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;

    if (Object.keys(data).length > 0) {
      if (data.articulo != undefined) {
        this.clienteArticuloModel = data.articulo;
      }
      if (data.articulos != undefined) {
        this.clienteArticulosModel = data.articulos;
      }
    }

  }

  onCancelar() {
    try {
      this.dialogRef.close();
    } catch (error) {
      console.error('An error occurred in onAgregarArticulo:', error);
    }
  }

  onAgregarArticulo(clienteArticuloModel: ClienteArticuloModel) {
    try {
      this.dialogRef.close(clienteArticuloModel);
    } catch (error) {
      console.error('An error occurred in onAgregarArticulo:', error);
    }
  }
}
