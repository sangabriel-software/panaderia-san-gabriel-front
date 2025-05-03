import { encryptId } from "../../../../utils/CryptoParams";


export const handleNavigateToDescuentos = (navigate, sucursalId) => {
    const encryptedId = encryptId(sucursalId.toString());
    navigate(`stock-descuentos-lista/${encodeURIComponent(encryptedId)}`);
};