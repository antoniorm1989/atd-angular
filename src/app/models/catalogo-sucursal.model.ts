import { User } from "./user";

export class CatalogoSucursalModel {
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
}