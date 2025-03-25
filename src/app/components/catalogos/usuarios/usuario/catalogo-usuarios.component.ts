import { Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { Observable } from 'rxjs';
import { MessageComponent } from 'src/app/components/genericos/snack-message.component';
import { CatalogoRolModel } from 'src/app/models/catalogo-rol.model';
import { User } from 'src/app/models/user';
import { CatalogoRolesService } from 'src/app/services/catalogo-roles.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { UpdatePasswordComponent } from './password/update-password.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-catalogo-usuarios',
  templateUrl: './catalogo-usuarios.component.html',
  styleUrls: ['./catalogo-usuarios.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatalogoUsuariosComponent {

  action: string = 'view';
  title: string = '';
  form: FormGroup = new FormGroup({});
  submitted = false;
  id: string | undefined = '0';
  selectedFile: File | null = null;
  imageUrl: string | null = null;

  roles: CatalogoRolModel[] = [];
  selectedRol!: CatalogoRolModel;
  isEditMode: boolean = false;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private userService: UserService, private router: Router, private _snackBar: MatSnackBar, private catalogoRolesService: CatalogoRolesService, private dialog: MatDialog) {

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url.includes('/configuracion/catalogos/usuarios/detail')) {
        this.route.params.subscribe(params => {
          this.id = params['id'];
          if (this.id != undefined) {
            this.isEditMode = true;
            this.userService.getById(this.id).subscribe({
              next: (data) => {

                this.form.patchValue({
                  name: data.name,
                  last_name: data.last_name,
                  email: data.email,
                  celular: data.celular,
                  isAdmin: data.isAdmin,
                  notifications: data.notifications,
                  active: data.active,
                  rol: data.rol
                });

                if (data.photo)
                  this.imageUrl = `${environment.apiUrl}/images/users/${data.photo}`;

                this.route.queryParams.subscribe(params => {
                  switch (params['action']) {
                    case undefined:
                      this.action = 'view';
                      this.title = 'Consultar usuario';
                      this.form.disable();

                      break;
                    case 'edit':
                      this.action = 'edit';
                      this.title = 'Editar usuario';
                      break;
                  }
                });

                this.catalogoRolesService.getAll().subscribe({
                  next: (roles) => {
                    this.roles = roles;
                    this.selectedRol = roles.filter(function (rol) {
                      return data.rol && data.rol.id == rol.id;
                    })[0];

                    if (this.selectedRol && this.selectedRol.id) {
                      this.form.patchValue({
                        rol: this.selectedRol
                      });
                    }
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
            this.isEditMode = false;
            this.action = 'new';
            this.title = 'Agregar usuario';

            this.catalogoRolesService.getAll().subscribe({
              next: (roles) => {
                this.roles = roles;
                this.selectedRol = roles[0];
              },
              error: (e) => {
                console.log(e);
              }
            });
          }

          this.form = this.formBuilder.group({
            name: ['', [Validators.required]],
            last_name: ['', [Validators.required]],
            password: this.isEditMode ? [''] : ['', [Validators.required]],
            email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')]],
            isAdmin: [false, [Validators.required]],
            notifications: [true, [Validators.required]],
            active: [true, [Validators.required]],
            rol: [null, [Validators.required]],
            celular: [''],
            photo: null
          });
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

    let usuario = new User();
    usuario.id = this.id;
    usuario.name = this.f['name'].value;
    usuario.last_name = this.f['last_name'].value;
    usuario.email = this.f['email'].value;
    usuario.celular = this.f['celular'].value;
    usuario.isAdmin = this.f['isAdmin'].value;
    usuario.notifications = this.f['notifications'].value;
    usuario.active = this.f['active'].value;
    usuario.password = this.f['password'].value;
    usuario.rol = this.f['rol'].value;

    if (this.action == 'new') {
      this.userService.create(usuario).subscribe({
        next: (data) => {
          if (this.selectedFile != null)
            this.uploadPhoto(data.id).subscribe({
              next: () => {
                this.openMessageSnack();
                setTimeout(() => {
                  this.router.navigate(['configuracion/catalogos/usuarios']).then(() => {
                    this.router.events.subscribe(event => {
                      window.location.href = window.location.href;
                    });
                  });
                }, 3000);
              },
              error: (e) => {
                console.log(e);
              }
            });
          else {
            this.openMessageSnack();
            this.router.navigate(['configuracion/catalogos/usuarios']);
          }
        },
        error: (e) => {
        }
      });
    } else {
      this.userService.update(usuario).subscribe({
        next: (data) => {
          if (this.selectedFile != null) {
            let id = usuario.id ? Number.parseInt(usuario.id) : 0;
            this.uploadPhoto(id).subscribe({
              next: () => {
                this.openMessageSnack();
                this.router.navigate(['configuracion/catalogos/usuarios']).then(() => {
                  this.router.events.subscribe(event => {
                    window.location.href = window.location.href;
                  });
                });
              },
              error: (e) => {
                console.log(e);
              }
            });
          }
          else {
            this.openMessageSnack();
            this.router.navigate(['configuracion/catalogos/usuarios']);
          }
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
    this.title = 'Editar usuario';
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
    return this.userService.uploadPhoto(id, formData);
  }

  openEditarPasswordModalComponent() {
    const dialogRef = this.dialog.open(EditarPasswordModalComponent, {
      height: '210px',
      width: '400px',
      data: {
        userId: this.id
      },
    });
    dialogRef.afterClosed().subscribe((isUpdated: any) => {
      if (isUpdated)
        this.openMessageSnack();
    });
  }

  isCurrentUser(): boolean {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"email":""}');
    return userData.email == this.f['email'].value;
  }

}

@Component({
  selector: 'dialog-component',
  template: `<span mat-dialog-title>Actualizar contraseña</span>
            <mat-dialog-content class="mat-typography">
              <app-update-password [userId]="userId" (cancel)="onCancelar()" (update)="onUpdatePassowrd($event)" #appUpdatePasswordComponent></app-update-password>
            </mat-dialog-content>`,
  styles: [
  ]
})
export class EditarPasswordModalComponent {
  @ViewChild('editarPasswordModalComponent') appVentaArticuloComponent: any;
  userId = '0';

  constructor(
    public dialogRef: MatDialogRef<UpdatePasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
    if (Object.keys(data).length > 0) {
      if (data.userId != undefined) {
        this.userId = data.userId;
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

  onUpdatePassowrd(isUpdated: boolean) {
    try {
      this.dialogRef.close(isUpdated);
    } catch (error) {
      console.error('An error occurred in onAgregarArticulo:', error);
    }
  }
}
