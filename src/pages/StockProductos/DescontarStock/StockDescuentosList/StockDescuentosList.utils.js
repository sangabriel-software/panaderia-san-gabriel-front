import { encryptId } from "../../../../utils/CryptoParams";


export const handleNavigate = (navigate, sucursalId, ruta) => {
    const encryptedId = encryptId(sucursalId.toString());
    navigate(`/stock-productos/${ruta}/${encodeURIComponent(encryptedId)}`);
};
