import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageComponent } from 'src/app/components/genericos/snack-message.component';
import { CatalogoCuentaBancariaModel, CatalogoMonedaModel } from 'src/app/models/catalogos.model';
import { User } from 'src/app/models/user';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { CatalogoCuentaBancariaService } from 'src/app/services/catalogo-cuenta-bancaria.service';

@Component({
  selector: 'app-catalogo-cuentaBancaria',
  templateUrl: './catalogo-cuenta-bancaria-detail..component.html',
  styleUrls: ['./catalogo-cuenta-bancaria-detail.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatalogoCuentaBancariaComponent implements OnInit {

  action: string = 'view';
  title: string = '';
  form: FormGroup;
  submitted = false;
  id = 0;
  isNumeroCuentaDuplicate: boolean = false;
  monedas: CatalogoMonedaModel[] = [];

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private catalogoCuentaBancariaService: CatalogoCuentaBancariaService, private router: Router, private _snackBar: MatSnackBar, private catalogoArticuloService: CatalogoArticuloService) {
    this.form = this.formBuilder.group({
      numero_cuenta: ['', [Validators.required, Validators.pattern(/^\d{8,20}$/)]],
      descripcion: ['', [Validators.required]],
      moneda: [''],
      banco: [''],
      activo: [true],
    });   
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      if (this.id != undefined) {
        this.catalogoCuentaBancariaService.getById(this.id).subscribe({
          next: (data) => {

            let cuentaBancaria = data as CatalogoCuentaBancariaModel;

            this.form.patchValue({
              numero_cuenta: cuentaBancaria.numero_cuenta,
              descripcion: cuentaBancaria.descripcion,
              moneda: cuentaBancaria.moneda,
              banco: cuentaBancaria.banco,
              activo: cuentaBancaria.activo,
            });

            this.route.queryParams.subscribe(params => {
              switch (params['action']) {
                case undefined:
                  this.action = 'view';
                  this.title = 'Consultar cuenta bancaria';
                  this.form.disable();
                  break;
                case 'edit':
                  this.action = 'edit';
                  this.title = 'Editar cuenta bancaria';
                  break;
              }
            });

            this.catalogoArticuloService.getMonedas().subscribe({
              next: (data) => {
                this.monedas = data;
                var moneda = data.filter(m => m.id == cuentaBancaria.moneda?.id);
                if (moneda.length > 0)
                  this.f['moneda'].setValue(moneda[0]);
              }
            });
          },
          error: (e) => {
          }
        });
      } else {
        this.action = 'new';
        this.title = 'Agregar cuenta bancaria';

        this.catalogoArticuloService.getMonedas().subscribe({
          next: (data) => {
            this.monedas = data;
            this.f['moneda'].setValue(data[0]);
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
    this.isNumeroCuentaDuplicate = false;

    // stop here if form is invalid
    if (this.form!.invalid)
      return;

    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
    let user = new User();
    user.id = userData.id;

    let cuentaBancaria = new CatalogoCuentaBancariaModel();
    cuentaBancaria.id = this.id;
    cuentaBancaria.numero_cuenta = this.f['numero_cuenta'].value;
    cuentaBancaria.descripcion = this.f['descripcion'].value;
    cuentaBancaria.moneda = this.f['moneda'].value;
    cuentaBancaria.banco = this.f['banco'].value;
    cuentaBancaria.activo = this.f['activo'].value == true;
    cuentaBancaria.user = user;

    if (this.action == 'new') {
      this.catalogoCuentaBancariaService.create(cuentaBancaria).subscribe({
        next: (data) => {
          this.openMessageSnack();
          this.router.navigate(['venta/catalogos/cuenta-bancaria']);
        },
        error: (e) => {
          if (e.error.error == 'Name already exists')
            this.isNumeroCuentaDuplicate = true;

          console.log(e);
        }
      });
    } else {
      this.catalogoCuentaBancariaService.update(cuentaBancaria).subscribe({
        next: (data) => {
          this.openMessageSnack();
          this.router.navigate(['venta/catalogos/cuenta-bancaria']);
        },
        error: (e) => {
          if (e.error.error == 'Name already exists')
            this.isNumeroCuentaDuplicate = true;

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
    this.title = 'Editar cuenta bancaria';
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
