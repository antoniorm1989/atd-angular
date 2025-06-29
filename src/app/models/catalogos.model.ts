import Integer from "@zxing/library/esm/core/util/Integer";
import { User } from "./user";

export class CatalogoCountryModel {
  id: string | undefined;
  name: string | undefined;
  key: string | undefined;
}

export class CatalogoStateModel {
  id: string | undefined;
  name: string | undefined;
  key: string | undefined;
}

export class CatalogoCityModel {
  id: string | undefined;
  code: string | undefined;
  name: string | undefined;
}

export class CatalogoRegimenFiscalModel {
  id: string | undefined;
  name: string | undefined;
  key: number | undefined;
  persona_fisica: boolean | undefined;
  persona_moral: boolean | undefined;
}

export class CatalogoUsoCfdiModel {
  id: string | undefined;
  name: string | undefined;
  key: string | undefined;
}

export class CatalogoFormaPagoModel {
  id: string | undefined;
  name: string | undefined;
  key: string | undefined;
}

export class CatalogoObjetoImpuestoModel {
  id: string | undefined;
  name: string | undefined;
  key: string | undefined;
}

export class CatalogoProductoServicioModel {
  key: string | undefined;
  name: string | undefined;
  complement: string | undefined;
}

export class CatalogoUnidadMedidaModel {
  key: string | undefined;
  name: string | undefined;
}

export class CatalogoMetodoPagoModel {
  id: string | undefined;
  name: string | undefined;
  key: string | undefined;
}

export class CatCmpraVentaEstatus {
  id: number | undefined;
  name: string | undefined;
};

export class CatalogoMotivoCancelacionModel{
  clave: string | undefined;
  motivo: string | undefined;
}

export class CatalogoMonedaModel {
  id: number | undefined;
  moneda: string | undefined;
  datosJson: string | undefined;
}

export class CatalogoCuentaBancariaModel{
  id: number | undefined;
  numero_cuenta: string | undefined;
  descripcion: string | undefined;
  moneda: CatalogoMonedaModel | undefined;
  banco: string | undefined;
  activo: boolean | undefined;
  user: User | undefined;
}

