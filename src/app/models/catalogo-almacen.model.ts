import { User } from "./user";

export class CatalogoAlmacenModel {
  id: number | undefined;
  name: string | undefined;
  description: string | undefined;
  phone: string | undefined;
  street: string | undefined;
  neighborhood: string | undefined;
  external_number: string | undefined;
  internal_number: string | undefined;
  postal_code: string | undefined;
  show_admin_users: boolean | undefined;
  status: string | undefined;
  city_key: string | undefined;
  state_key: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  user: User | undefined;
  sucursales: Array<CatalogoAlmacenSucursalModel> | undefined;

  constructor(id?: number) {
   this.id = id;
  }
}

export class CatalogoAlmacenSucursalModel {
  id: number | undefined;
  sucursal_id: number | undefined;
  name: string | undefined;
  created_at: Date | undefined;
  user: User | undefined;
}