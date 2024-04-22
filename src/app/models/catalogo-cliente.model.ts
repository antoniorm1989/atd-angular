import { CatalogoCityModel, CatalogoCountryModel, CatalogoRegimenFiscalModel, CatalogoStateModel } from "./catalogos.model";
import { User } from "./user";

export class CatalogoClienteModel {
  id: number | undefined;
  cliente: string | undefined;
  tipo: string | undefined;
  rfc: string | undefined;
  nombre_fiscal: string | undefined;
  nombre: string | undefined;
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

  constructor(id?: number) {
    this.id = id;
  }
}