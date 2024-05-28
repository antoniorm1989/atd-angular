import { CatalogoCityModel, CatalogoStateModel } from "./catalogos.model";
import { User } from "./user";

export class CatalogoProveedorModel {
  id: number | undefined;
  proveedor: string | undefined;
  nombreContacto: string | undefined;
  apellidoContacto: string | undefined;
  tiempoEstimadoEntrega: number | undefined;
  unidadTiempo: string | undefined;
  celular: string | undefined;
  telefono: string | undefined;
  correo: string | undefined;
  cuentaBancaria: string | undefined;
  rfc: string | undefined;
  descripcion: string | undefined;
  state: CatalogoStateModel | undefined;
  city: CatalogoCityModel | undefined;
  calle: string | undefined;
  colonia: string | undefined;
  numero_exterior: string | undefined;
  numero_interior: string | undefined;
  cp: string | undefined;
  
  user: User | undefined;
  status: boolean | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;

  constructor(id?: number) {
    this.id = id;
  }
}