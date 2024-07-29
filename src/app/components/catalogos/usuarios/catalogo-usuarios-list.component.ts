import { Component } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-catalogo-usuarios-list',
  templateUrl: './catalogo-usuarios-list.component.html',
  styleUrls: ['./catalogo-usuarios-list.component.css']
})

export class CatalogoUsuariosListComponent {

  hasRecords = false;
  dataLoaded = false;
  usuarios: Array<User> = [];

  constructor(private userService: UserService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url == '/catalogos/usuarios' && !this.dataLoaded) {
        this.userService.getAll().subscribe({
          next: (data) => {
            if (data.length > 0) {
              this.hasRecords = true;
              this.dataLoaded = true;
              this.usuarios = data;
            }
          },
          error: (e) => {
          }
        });
      }
    });
  }

  onNew() {
    this.router.navigate(['catalogos/usuarios/detail']);
  }

  onView(id: string | undefined){
    this.router.navigate(['catalogos/usuarios/detail', id]);
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  getUrlPhoto(photo: string | undefined): string {
    if (photo && photo != '')
      return `${environment.apiUrl}/images/users/${photo}`; 
    else
      return `../../assets/images/empty-image.png`;
  }

}
