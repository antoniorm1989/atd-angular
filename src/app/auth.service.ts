import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  login(username: string, password: string): boolean {
    // Perform authentication logic here
    return username === 'antonio' && password === '123456';
  }

  isLoggedIn(): boolean {
    // Check if user is logged in
    return true; // You can implement proper checks here
  }

  logout(): void {
    // Implement logout logic
  }
}
