import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MessageComponent } from '../../genericos/snack-message.component';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class ChangePasswordComponent implements OnInit {

  form: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string = '';
  hidePassword: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private _snackBar: MatSnackBar
  ) {

    this.form = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(4)]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/inventario-almacen';
  }

  get f() { return this.form!.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form!.invalid)
      return;

    this.loading = true;

    let userData = JSON.parse(localStorage.getItem('user_data') || '{"id":0}');
    let user = new User();
    user.id = userData.id;
    user.password = this.f['password'].value
    user.isPasswordTemp = false;

    const rememberedCredentials = localStorage.getItem('rememberedCredentials');
    if (rememberedCredentials) {
      localStorage.setItem('rememberedCredentials', JSON.stringify({ email: userData.email, password: this.f['password'].value }));
    }

    this.userService.updatePassword(user).subscribe({
      next: (data) => {
        this.openMessageSnack();

        userData.isPasswordTemp = 0;
        localStorage.setItem('user_data', JSON.stringify(userData));

        if (this.isValidRoute(this.returnUrl)) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.router.navigate(['/inventario-almacen']);
        }
      },
      error: (e) => {
        this.loading = false; 
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

  // Custom validator to check if password and confirmPassword match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value || '';
    const confirmPassword = form.get('confirmPassword')?.value || '';

    if (password !== confirmPassword) {
      return { mismatch: true };
    } else {
      return null;
    }
  }

  btnBack() {
    this.userService.logout();
  }
}
