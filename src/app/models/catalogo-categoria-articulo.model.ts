import { User } from "./user";
import { float } from "@zxing/library/esm/customTypings";

export class CatalogoCategoriaArticuloModel {
  id: number | undefined;
  name: string | undefined;
  description: string | undefined;
  show_admin_users: boolean | undefined;
  status: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  user: User | undefined;
  costo_importado_porcentaje: float | undefined;
  precio_venta_porcentaje: float | undefined;



  constructor(
    id?: number,
    name?: string,
  ) {
    this.id = id;
    this.name = name;
  }
}