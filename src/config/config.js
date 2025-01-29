import { enviromentConfig } from "./enviroment-configuraton";


const env = import.meta.env.VITE_ENV || 'DEV';

const enviroment = enviromentConfig[env];

export {enviroment};