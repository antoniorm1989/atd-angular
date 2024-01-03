import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { UserService } from './services/user.service';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnDestroy {

  title = 'atd-app';
  mobileQuery: MediaQueryList;
  fillerNav = [
    {
      text: 'Almacen', icon: 'fa-brands fa-dropbox', href: 'inventario-almacen'
    },
    {
      text: 'Sucursales', icon: 'fa-solid fa-clipboard-check', href: 'sucursales'
    }
  ];
  fillerNavEnd = [
    {
      text: 'Catálogos', icon: 'fa-solid fa-book', href: 'catalogos'
    }
  ];
  userInitials: string = "";

  private _mobileQueryListener: () => void;

  @ViewChild('snav') sidenav!: MatSidenav;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private userService: UserService, private router: Router) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","lastname":""}');
        if (userData.name != '' && userData.lastname)
          this.userInitials = userData.name[0].toUpperCase() + userData.lastname[0].toUpperCase();
      }
    });
  }

    ngAfterViewInit() {
        // Close and open the sidenav to trigger its adaptation
        this.sidenav.close();
        this.sidenav.open();
    }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  getFormattedDate(): string {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Months are zero-based
    const year = currentDate.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = month < 10 ? `0${month}` : `${month}`;

    return `${formattedDay}/${formattedMonth}/${year}`;
  }

  public get isTokenValid(): boolean {
    return this.userService.isTokenValid();
  }

  get userName(): string {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","lastname":""}');
    return `${userData.name} ${userData.lastname}`;
  }

  logout() {
    this.userService.logout();
  }

}