import { User } from "./user";

export class CatalogoRolModel {
  id: number | undefined;
  name: string | undefined;
  description: string | undefined;
  rights: string | undefined;
  show_admin_users: boolean | undefined;
  status: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  user: User | undefined;
}