import { environmentEnum } from 'src/app/global/tools';

export const environment = {
    environment: environmentEnum.production,
    apiUrl: 'https://portal.atdtools.com.mx:3000',
    fileFolder: '/Users/antonio.rosales/files/development',
    emisorFactura: {
        emisor: 'ATD TOOLS',
        rfc: 'ATO2202016X3',
        domicilioFiscal: 'BRASIL 2378 Col. ALIANZA PARA LA PRODUCCIÓN, C.P. 21229, Mexicali, Baja California, México',
        lugarDeExpidicion: '21229',
        regimenFiscal: '601 - General de Ley Personas Morales'
    }
};
