import { encryptId } from "../../../utils/CryptoParams";


export const handleViewDetalle = (idOrdenProduccion, navigate) => {
    const encryptedId = encryptId(idOrdenProduccion.toString()); 
    navigate(`detalle-orden/${encodeURIComponent(encryptedId)}`); 
  };