import { encryptId } from "../../../utils/CryptoParams";


export const handleViewDetalleVenta = (idVenta, navigate) => {
  const encryptedId = encryptId(idVenta.toString());
  navigate(`detalle-venta/${encodeURIComponent(encryptedId)}`);
};