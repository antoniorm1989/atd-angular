import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { pipe } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

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
  returnUrl: string | undefined;
  remember: boolean = false;
  hidePassword: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) { 

    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

  }


  ngOnInit() {

    //const rememberedUsername = localStorage.getItem('rememberedUsername');
    //if (rememberedUsername) {
     // this.username = rememberedUsername;
      //this.remember = true;
   /// }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/almacen';
  }

  get f() { return this.form!.controls; }

  onSubmit() {

    this.submitted = true;

    //if (this.remember) {
    //  localStorage.setItem('rememberedUsername', this.username);
    //} else {
    //  localStorage.removeItem('rememberedUsername');
    //}

    // stop here if form is invalid
    if (this.form!.invalid) {
      return;
    }

    this.loading = true;
    this.userService.login(this.f['email'].value, this.f['password'].value)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.loading = false;
        });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}
