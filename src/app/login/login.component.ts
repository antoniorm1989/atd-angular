import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  remember: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      this.username = rememberedUsername;
      this.remember = true;
    }
  }

  login(): void {

    if (this.remember) {
      localStorage.setItem('rememberedUsername', this.username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }

    if (this.authService.login(this.username, this.password)) {
      this.router.navigate(['/dashboard']);
    } else {
      // Handle failed login
    }
  }
}
