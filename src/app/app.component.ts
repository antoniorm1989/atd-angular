import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { UserService } from './services/user.service';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { CommunicationService } from './services/communication.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnDestroy {

  title = 'atd-app';
  mobileQuery: MediaQueryList;
  fillerNavWithSubmenu = [
    {
      text: 'Almacenes',
      icon: 'fa-brands fa-dropbox',
      subItems: [
        {
          text: 'Catálogos',
          icon: 'fa-solid fa-book',
          href: 'almacenes/catalogos'
        },
        {
          text: 'Inventarios',
          icon: 'fa-brands fa-dropbox',
          href: 'inventario-almacen',
        }
      ]
    }, {
      text: 'Ventas',
      icon: 'fa-solid fa-cash-register',
      subItems: [
        {
          text: 'Catálogos',
          icon: 'fa-solid fa-book',
          href: 'venta/catalogos'
        },
        {
          text: 'Cotizaciones',
          icon: 'fa-solid fa-file-invoice',
          href: 'cotizaciones',
        },
        {
          text: 'Ventas',
          icon: 'fa-solid fa-money-bill',
          href: 'ventas',
        }
      ]
    }, {
      text: 'Compras',
      icon: 'fa-solid fa-money-check-dollar',
      subItems: [
        {
          text: 'Catálogos',
          icon: 'fa-solid fa-book',
          href: 'compras/catalogos'
        },
        {
          text: 'Orden de compra',
          icon: 'fa-solid fa-tag',
          href: 'orden-compra',
        }
      ]
    }, {
      text: 'Configuración',
      icon: 'fa-solid fa-gear',
      subItems: [
        {
          text: 'Catálogos',
          icon: 'fa-solid fa-book',
          href: 'configuracion/catalogos'
        },
        {
          text: 'Sistema',
          icon: 'fa-solid fa-cogs',
          href: 'configuracion/sistema',
        }
      ]
    }
  ];
  userInitials: string = "";
  hasPhoto: boolean = false;

  private _mobileQueryListener: () => void;

  @ViewChild('snav') sidenav!: MatSidenav;

  constructor(changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private userService: UserService,
    private router: Router,
    private communicationService: CommunicationService) {

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
        if (userData.name != '' && userData.last_name)
          this.userInitials = userData.name[0].toUpperCase() + userData.last_name[0].toUpperCase();
      }
    });
  }

  ngOnInit(): void {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"photo":""}');

    this.hasPhoto = !!userData.photo && userData.photo !== 'null';

    this.communicationService.methodCalled$.subscribe(() => {
      setTimeout(() => {
        this.updateMenu();
      }, 100);
    });

    setInterval(() => {
      if (!this.isTokenValid) {
        this.sidenav.close();
        localStorage.removeItem('user_data');
        this.router.navigate(['/login']);
      }
    }, 30000); // 30,000 ms = 30 segundos
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
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"isPasswordTemp":0}');
    return this.userService.isTokenValid() && userData.isPasswordTemp == 0;
  }

  get userName(): string {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
    return `${userData.name} ${userData.last_name}`;
  }

  logout() {
    this.userService.logout();
  }

  updateMenu() {
    this.sidenav.close();
    if (!this.mobileQuery.matches)
      this.sidenav.open();
  }

  getUrlPhoto(): string {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"photo":""}');
    return `${environment.apiUrl}/images/users/${userData.photo}`;
  }

  isSubmenuActive(subItems: any[]): boolean {
    return subItems.some(subItem => this.router.isActive(subItem.href, false));
  }

  getTipoCambio(): number {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (userData.configuraciones && userData.configuraciones.length > 0) {
      let configuracion = userData.configuraciones.find((config: any) => config.name === 'tipo_cambio');
      if (configuracion) {
        return configuracion.value;
      }
    }
    return 0;
  }
}