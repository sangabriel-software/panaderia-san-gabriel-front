const roleIcons = {
    Admin: "fa-solid fa-user-tie",
    Panadero: "fa-solid fa-cake-candles",
    Contador: "fa-solid fa-file-invoice-dollar",
    Vendedoras: "fa-solid fa-bag-shopping",
    TI: "fa-solid fa-server"
    // Add more roles and their corresponding icons here
  };
  
  export const getIcon = (roleName) => {
    return roleIcons[roleName] || "fa-solid fa-chart-simple"; // Icono predeterminado si no se encuentra el rol
  };
  
