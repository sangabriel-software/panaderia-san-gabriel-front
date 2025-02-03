

export const compressImage = (file, maxSizeKB = 20) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Redimensionar la imagen manteniendo la proporción
          const MAX_WIDTH = 800; // Ancho máximo
          const MAX_HEIGHT = 800; // Alto máximo
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Dibujar la imagen redimensionada en el canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Reducir la calidad de la imagen
          let quality = 0.9; // Calidad inicial
          let base64 = canvas.toDataURL("image/jpeg", quality);

          // Reducir el tamaño hasta que sea menor a maxSizeKB
          while (base64.length > maxSizeKB * 1024 && quality > 0.1) {
            quality -= 0.1;
            base64 = canvas.toDataURL("image/jpeg", quality);
          }

          resolve(base64);
        };

        img.onerror = (error) => reject(error);
      };

      reader.onerror = (error) => reject(error);
    });
  };