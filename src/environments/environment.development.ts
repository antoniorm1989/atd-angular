import { environmentEnum } from 'src/app/global/tools';

export const environment = {
    environment: environmentEnum.development,
    apiUrl: 'http://localhost:3000',
    fileFolder: '/Users/antonio.rosales/files/development',
    emisorFactura: {
        emisor: 'AZUCENA DEL ROCIO ORTIZ BEDOLLA',
        rfc: 'OIBA910426F38',
        domicilioFiscal: 'caninas 421 Int: SN Col. Privada Campestre, C.P. 21383, Mexicali, Baja California, México',
        lugarDeExpidicion: '45079 México',
        regimenFiscal: '612 - Personas Físicas con Actividades Empresariales y Profesionales'
    }
};

