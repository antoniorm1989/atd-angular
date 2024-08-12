import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MessageComponent } from '../genericos/snack-message.component';
import { CommunicationService } from 'src/app/services/communication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class LoginComponent implements OnInit {

  form: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string = '';
  hidePassword: boolean = true;
  loginFail: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private communicationService: CommunicationService
  ) {

    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      remember: [false],
    });

  }

  ngOnInit() {
    const rememberedCredentials = localStorage.getItem('rememberedCredentials');
    if (rememberedCredentials) {
      let rememberedCredentialsJson = JSON.parse(rememberedCredentials);
      this.f['email'].setValue(rememberedCredentialsJson.email);
      this.f['password'].setValue(rememberedCredentialsJson.password);
      this.f['remember'].setValue(true);
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/inventario-almacen';
  }

  get f() { return this.form!.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form!.invalid)
      return;

    if (this.f['remember'].value)
      localStorage.setItem('rememberedCredentials', JSON.stringify({ email: this.f['email'].value, password: this.f['password'].value }));
    else
      localStorage.removeItem('rememberedCredentials');

    this.loading = true;
    this.userService.login(this.f['email'].value, this.f['password'].value)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.communicationService.callMethod();
          localStorage.setItem('user_data', JSON.stringify(data));

          if (data.isPasswordTemp) {
            this.router.navigate(['login/change-password']);
            return;
          } else {
            this.openMessageSnack();
            if (this.isValidRoute(this.returnUrl)) {
              this.router.navigate([this.returnUrl]);
            } else {
              this.router.navigate(['/inventario-almacen']);
            }
            this.loginFail = false;
          }
        },
        error: (e) => {
          this.loading = false;
          this.loginFail = true;
        }
      });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  openMessageSnack() {
    const config: MatSnackBarConfig = {
      duration: 5000,
      data: {
        html: '✅ <b>La acción se realizó con éxito.</b><br/> Se ha iniciado sesión correctamente',
      },
    };
    this._snackBar.openFromComponent(MessageComponent, config);
  }

  private isValidRoute(route: string): boolean {
    // Extract the path from the route (remove query parameters if any)
    const path = route.split('?')[0];

    // Check if the path exists in the defined routes
    const validRoutes = this.router.config.map(route => route.path);
    return validRoutes.includes(path);
  }
}
