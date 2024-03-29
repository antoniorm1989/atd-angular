import { User } from "./user";

export class CatalogoCategoriaArticuloModel {
  id: number | undefined;
  name: string | undefined;
  description: string | undefined;
  show_admin_users: boolean | undefined;
  status: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  user: User | undefined;

  constructor(
    id?: number,
    name?: string,
  ) {
    this.id = id;
    this.name = name;
  }
}