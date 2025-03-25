import { CatalogoRolModel } from "./catalogo-rol.model";

export class User {
    id: string | undefined;
    name: string | undefined;
    last_name: string | undefined;
    email: string | undefined;
    token: string | undefined;
    photo: string | undefined;
    celular: string | undefined;
    isAdmin: boolean | undefined;
    notifications: boolean | undefined;
    active: boolean | undefined;
    password: string | undefined;
    rol: CatalogoRolModel | undefined;
    isPasswordTemp: boolean | undefined;
}