import { float } from "@zxing/library/esm/customTypings";
import { CatalogoCityModel, CatalogoCountryModel, CatalogoRegimenFiscalModel, CatalogoStateModel, CatalogoUsoCfdiModel } from "./catalogos.model";
import { User } from "./user";
import { CatalogoArticuloModel } from "./catalogo-articulo.model";
import { VentaArticuloModel } from "./ventas.model";

export class CatalogoClienteModel {
  id: number | undefined;
  cliente: string | undefined;
  tipo: string | undefined;
  rfc: string | undefined;
  nombre_fiscal: string | undefined;
  nombre: string | undefined;
  apellidos: string | undefined;
  correo: boolean | undefined;
  telefono: string | undefined;
  calle: string | undefined;
  colonia: string | undefined;
  numero_exterior: string | undefined;
  numero_interior: string | undefined;
  cp: string | undefined;
  status: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;

  user: User | undefined;
  country: CatalogoCountryModel | undefined;
  state: CatalogoStateModel | undefined;
  city: CatalogoCityModel | undefined;
  regimen_fiscal: CatalogoRegimenFiscalModel | undefined;
  uso_cfdi: CatalogoUsoCfdiModel | undefined;

  articulos: ClienteArticuloModel[] | undefined;

  full_direction: string | undefined;

  constructor(id?: number) {
    this.id = id;
  }
}

export class ClienteArticuloModel {
  id: number | undefined;
  precio: float | undefined;
  descuento: float | undefined;
  comentarios: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  articulo: CatalogoArticuloModel | undefined;
}