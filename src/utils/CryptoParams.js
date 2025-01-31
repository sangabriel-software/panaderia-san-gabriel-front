import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_PARAMS_SEC;


// Cifra un texto
export const encryptId = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

// Descifra un texto
export const decryptId = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
