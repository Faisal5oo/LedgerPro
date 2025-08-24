import SecureStorage from "secure-web-storage";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.SECRET_KEY

const secureStorage = new SecureStorage(localStorage, {
  hash: function (key) {
    return CryptoJS.SHA256(key + SECRET_KEY).toString();
  },
  encrypt: function (data) {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  },
  decrypt: function (data) {
    const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  },
});

export default secureStorage;
