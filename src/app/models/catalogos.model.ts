export class CatalogoStateModel {
  id: string;
  name: string;
  key: string;
  created: Date;
  modified: Date;

  constructor(id: string, name: string, key: string, created: Date, modified: Date) {
    this.id = id;
    this.name = name;
    this.key = key;
    this.created = created;
    this.modified = modified;
  }
}

export class CatalogoCityModel {
  id: string;
  name: string;
  key: string;
  keyState: string;
  created: Date;
  modified: Date;

  constructor(id: string, name: string, key: string, keyState: string, created: Date, modified: Date) {
    this.id = id;
    this.name = name;
    this.key = key;
    this.keyState = keyState;
    this.created = created;
    this.modified = modified;
  }
}