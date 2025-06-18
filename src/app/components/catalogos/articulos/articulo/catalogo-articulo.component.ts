import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject, signal} from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { Observable, startWith, map } from 'rxjs';
import { MessageComponent } from 'src/app/components/genericos/snack-message.component';
import { CatalogoArticuloModel } from 'src/app/models/catalogo-articulo.model';
import { CatalogoCategoriaArticuloModel } from 'src/app/models/catalogo-categoria-articulo.model';
import { CatalogoMonedaModel, CatalogoProductoServicioModel, CatalogoUnidadMedidaModel } from 'src/app/models/catalogos.model';
import { User } from 'src/app/models/user';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { CatalogoCategoriaArticuloService } from 'src/app/services/catalogo-categoria-articulos.service';
import { environment } from 'src/environments/environment';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

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
  selectedCategory!: CatalogoCategoriaArticuloModel

  selectedFile: File | null = null;
  imageUrl: string | null = null;
  isPartNumberDuplicate: boolean = false;
  monedas: CatalogoMonedaModel[] = [];

  costoImportadoManual: boolean = false;
  precioVentaManual: boolean = false;

  productoServicioList: CatalogoProductoServicioModel[] = [];
  unidadMedidaList: CatalogoUnidadMedidaModel[] = [];

  filteredProductoServicio: Observable<any[]> | undefined;
  filteredUnidadMedida: Observable<any[]> | undefined;

  templateKeywords: string[] = [];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private catalogoArticuloService: CatalogoArticuloService, private router: Router, private catalogoCategoriaArticuloService: CatalogoCategoriaArticuloService, private _snackBar: MatSnackBar, private catalogosService: CatalogosService,) {

    this.form = this.formBuilder.group({
      part_number: ['', [Validators.required]],
      description: ['', [Validators.required]],
      comment: 'sin comentarios',
      category: '',
      show_admin_users: '',
      status: true,
      created_at: '',
      selectedCategory: [null, Validators.required],
      photo: null,
      es_inventariado: true,
      costo_proveedor: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      costo_importado: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      precio_venta: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      moneda: [null, Validators.required],
      unidad_medida: [''],
      producto_servicio_model: [null, [this.validarProductoServicio.bind(this)]],
      unidad_medida_model: [null, [this.validarUnidadMedida.bind(this)]],
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url.includes('/almacenes/catalogos/articulos/detail')) {

        this.route.params.subscribe(params => {
          this.id = params['id'];
          if (this.id != undefined) {
            this.catalogoArticuloService.getById(this.id).subscribe({
              next: (data) => {

                this.costoImportadoManual = true;
                this.precioVentaManual = true;

                var articulo = data;

                this.form.patchValue({
                  part_number: data.part_number,
                  description: data.description,
                  comment: data.comment,
                  show_admin_users: data.show_admin_users,
                  status: data.status,
                  created_at: data.created_at,
                  selectedCategory: [null, Validators.required],
                  es_inventariado: data.es_inventariado,
                  costo_proveedor: data.costo_proveedor,
                  costo_importado: data.costo_importado,
                  precio_venta: data.precio_venta,
                  moneda: [null, Validators.required],
                  unidad_medida: data.unidad_medida,
                  producto_servicio_model: data.producto_servicio_model,
                  unidad_medida_model: data.unidad_medida_model,
                });

                this.templateKeywords = (data.tags || []).map(tag => tag.tag);

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

                this.catalogoCategoriaArticuloService.getAll(0, 1000).subscribe({
                  next: (data) => {
                    console.log("carga data");
                    if (data.total > 0) {
                      console.log("mayor a 0");
                      this.categories = data.data;
                      var category = data.data.filter(c => c.id == articulo.cat_articulo_id)
                      if (category.length > 0){
                        console.log("category", category);
                        this.f['selectedCategory'].setValue(category[0]);
                      }
                    }
                  },
                  error: (e) => {
                  }
                });

                this.catalogoArticuloService.getMonedas().subscribe({
                  next: (data) => {
                    this.monedas = data;
                    var moneda = data.filter(m => m.id == articulo.moneda?.id)
                    if (moneda.length > 0)
                      this.f['moneda'].setValue(moneda[0]);
                  }
                });

                this.catalogosService.getProductoServicio().subscribe({
                  next: (data) => {

                    this.productoServicioList = data;
                    if(this.f['producto_servicio_model'].value){
                      var productoServicio = data.filter(p => p.key == this.f['producto_servicio_model'].value.key)
                      if (productoServicio.length > 0)
                        this.f['producto_servicio_model'].setValue(productoServicio[0]);
                    }
                  },
                  error: (e) => {
                    console.error(e);
                  }
                });
            
                this.catalogosService.getUnidadMedida().subscribe({
                  next: (data) => {
                    this.unidadMedidaList = data;
                    if(this.f['unidad_medida_model'].value){
                      var unidadMedida = data.filter(p => p.key == this.f['unidad_medida_model'].value.key)
                      if (unidadMedida.length > 0)
                        this.f['unidad_medida_model'].setValue(unidadMedida[0]);
                    }
                  },
                  error: (e) => {
                    console.error(e);
                  }
                });
              },
              error: (e) => {
              }
            });
          } else {
            this.action = 'new';
            this.title = 'Agregar artículo';
            this.catalogoCategoriaArticuloService.getAll(0, 1000).subscribe({
              next: (data) => {
                if (data.total > 0) {
                  this.categories = data.data;
                }
              },
              error: (e) => {
              }
            });

            this.catalogoArticuloService.getMonedas().subscribe({
              next: (data) => {
                this.monedas = data;
                this.f['moneda'].setValue(data[0]);
              }
            });

            this.catalogosService.getProductoServicio().subscribe({
              next: (data) => {
                this.productoServicioList = data;
              },
              error: (e) => {
                console.error(e);
              }
            });
            this.catalogosService.getUnidadMedida().subscribe({
              next: (data) => {
                this.unidadMedidaList = data;
              }
              , error: (e) => {
                console.error(e);
              }
            });

          }
        });
      }
    });

  }

  ngOnInit() {
    this.form.get('costo_proveedor')?.valueChanges.subscribe(value => {
      this.onCostoProveedorChange(value);
    });

    this.filteredProductoServicio = this.form.controls['producto_servicio_model'].valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.filteredUnidadMedida = this.form.controls['unidad_medida_model'].valueChanges.pipe(
      startWith(''),
      map(value => this._filterUnidadMedida(value))
    );
  }

  validarProductoServicio(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (!valor) return null;
    const esValido = this.productoServicioList.some(
      option => option.name === valor || option === valor
    );
    return esValido ? null : { invalidOption: true };
  }

  validarUnidadMedida(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (!valor) return null;
    const esValido = this.unidadMedidaList.some(
      option => option.name === valor || option === valor
    );
    return esValido ? null : { invalidOption: true };
  }

  displayFn(option: any): string {
    return option ? `${option.key} - ${option.name}` : '';
  }

  displayFnUnidadMedida(option: any): string {
    return option ? `${option.key} - ${option.name}` : '';
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
    articulo.costo_proveedor = this.f['costo_proveedor'].value;
    articulo.photo = '';
    articulo.show_admin_users = this.f['show_admin_users'].value == true;
    articulo.status = this.f['status'].value || '0';
    articulo.es_inventariado = this.f['es_inventariado'].value == true;
    articulo.user = user;
    articulo.cat_articulo_id = this.f['selectedCategory'].value.id;
    
    articulo.moneda = this.f['moneda'].value;
    articulo.costo_proveedor = this.f['costo_proveedor'].value;
    articulo.costo_importado = this.f['costo_importado'].value;
    articulo.precio_venta = this.f['precio_venta'].value;
    
    articulo.unidad_medida = this.f['unidad_medida'].value;
    articulo.producto_servicio_model = this.f['producto_servicio_model'].value;
    articulo.unidad_medida_model = this.f['unidad_medida_model'].value;
    articulo.tags = this.templateKeywords.map(tag => ({
      tag: tag,
      datosjson: null
    }));
    

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

  validarDecimal(event: KeyboardEvent): void {
    const allowedChars = /[0-9\.\,]/;
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (!allowedKeys.includes(event.key) && !allowedChars.test(event.key)) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;
    const value = input.value.replace(',', '.');

    const futureValue = value + event.key;
    const regexp = /^\d+(\.\d{0,2})?$/;

    if (!regexp.test(futureValue)) {
      event.preventDefault();
    }
  }

  validarFinal(controlName: string) {
    const value = this.f[controlName].value;
    const regexp = /^\d+(\.\d{1,2})?$/;
    if (!regexp.test(value)) {
      this.f[controlName].setErrors({ pattern: true });
    }
  }

  onCategoryChange(event: any) {
    if (this.f['costo_proveedor'].value) {
      let costo_proveedor = parseFloat(this.f['costo_proveedor'].value);

      if (costo_proveedor > 0) {
        let costo_importado_porcentaje = this.selectedCategory.costo_importado_porcentaje || 0;
        let precio_venta_porcentaje = this.selectedCategory.precio_venta_porcentaje || 0;

        let costo_importado = costo_proveedor * (1 + costo_importado_porcentaje / 100);

        let precio_venta = costo_importado * (1 + precio_venta_porcentaje / 100);

        this.f['costo_importado'].setValue(costo_importado.toFixed(2));
        this.f['precio_venta'].setValue(precio_venta.toFixed(2));
      }
    }

    this.costoImportadoManual = false;
    this.precioVentaManual = false;
  }

  onCostoProveedorChange(value: string) {
    const costoProveedor = parseFloat(value);
    if (isNaN(costoProveedor) || costoProveedor <= 0) {
      this.form.get('costo_importado')?.setValue(0);
      this.form.get('precio_venta')?.setValue(0);
      return;
    }else{
      const costo_importado_porcentaje = this.selectedCategory?.costo_importado_porcentaje || 0;
      const precio_venta_porcentaje = this.selectedCategory?.precio_venta_porcentaje || 0;
  
      const costo_importado = costoProveedor * (1 + costo_importado_porcentaje / 100);
      const precio_venta = costo_importado * (1 + precio_venta_porcentaje / 100);
  
      if (!this.costoImportadoManual) {
        this.form.get('costo_importado')?.setValue(costo_importado.toFixed(2), { emitEvent: false });
      }
  
      if (!this.precioVentaManual) {
        this.form.get('precio_venta')?.setValue(precio_venta.toFixed(2), { emitEvent: false });
      }
    }
  }

  addTemplateKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.templateKeywords.includes(value)) {
      this.templateKeywords.push(value);
    }

    event.chipInput!.clear();
  }

  removeTemplateKeyword(keyword: string): void {
    const index = this.templateKeywords.indexOf(keyword);
    if (index >= 0) {
      this.templateKeywords.splice(index, 1);
    }
  }

  trackByKeyword(index: number, keyword: string): string {
    return keyword;
  }

  private _filter(value: any): any[] {
    if (typeof value == 'object')
      value = value.name;

    // Solo filtra cuando la longitud del valor es mayor a 3
    if (value.length < 3) {
      return [];
    }

    const filterValue = value.toLowerCase();
    return this.productoServicioList.filter(option =>
      option.name!.toLowerCase().includes(filterValue)
    );
  }

  private _filterUnidadMedida(value: any): any[] {
    if (typeof value == 'object')
      value = value.name;

    // Solo filtra cuando la longitud del valor es mayor a 3
    if (value.length < 3) {
      return [];
    }

    const filterValue = value.toLowerCase();
    return this.unidadMedidaList.filter(option =>
      option.name!.toLowerCase().includes(filterValue)
    );
  }

}
