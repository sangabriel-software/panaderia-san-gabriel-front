import { enviroment } from "../config/config";

let isInitialized = false;

export const initBetterStack = () => {
    const isEnabled = enviroment.logEnabled === "true";
    const token = enviroment.better_token;

    if (!isEnabled || !token) {
        return;
    }

    (function (windowRef, documentRef, key) {
        windowRef[key] =
            windowRef[key] ||
            function (...args) {
                (windowRef[key].q = windowRef[key].q || []).push(args);
            };

        windowRef[key].l = +new Date();

        const script = documentRef.createElement("script");
        script.async = 1;
        script.crossOrigin = "anonymous";
        script.src = `https://betterstack.net/b.js?t=${token}`;

        (documentRef.head || documentRef.getElementsByTagName("head")[0]).appendChild(script);
    })(window, document, "betterstack");

    window.betterstack("init", { environment: "production" });

    isInitialized = true;
};

/**
 * Identifica al usuario logueado ante Better Stack.
 *
 * Es un no-op seguro cuando Better Stack está deshabilitado
 * (isInitialized === false) — así ningún componente que llame
 * esto necesita saber ni comprobar si está habilitado o no.
 */
export const identifyUser = ({ userId, name, userName, email }) => {
    if (!isInitialized || typeof window.betterstack !== "function") {
        return;
    }

    window.betterstack("user", {
        user_id: String(userId),
        name: name || undefined,
        userName: userName || undefined,
        email: email || undefined,
    });
};

/**
 * Elimina la identificación del usuario en Better Stack,
 * típicamente al cerrar sesión.
 *
 * Es un no-op seguro cuando Better Stack está deshabilitado.
 */
export const clearbetterUser = () => {
    if (!isInitialized || typeof window.betterstack !== "function") {
        return;
    }

    window.betterstack("user", null);
};