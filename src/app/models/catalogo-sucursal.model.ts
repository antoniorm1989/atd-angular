import { User } from "./user";

export class CatalogoSucursalModel {
    id: string;
    name: string;
    phone: string;
    location: string;
    status: boolean;
    created: Date;
    modified: Date;
    user: User;

    constructor(id: string, name: string, phone: string, location: string, status: boolean, created: Date, modified: Date, user: User) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.location = location;
        this.status = status;
        this.created = created;
        this.modified = modified;
        this.user = user;
      }
}