import React, { useState } from "react";
import { Form, Spinner } from "react-bootstrap";

function ImageUploader({ labelName, onImageChange, imagePreview }) {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageName, setImageName] = useState(""); // Estado para guardar el nombre del archivo

  const handleImageChange = (event) => {
    setImageLoading(true); // Activar el spinner antes de cargar la imagen

    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        onImageChange(file, imageUrl);
        setImageLoading(false); // Desactivar el spinner cuando la imagen termine de cargar
        setImageName(file.name); // Guardar el nombre del archivo
      };

      img.src = imageUrl;
    } else {
      setImageLoading(false);
      setImageName(""); // Resetear el nombre si no hay archivo
    }
  };

  return (
    <div className="mb-3">
      <Form.Label className="label-title">{labelName}</Form.Label>
      <div className="position-relative d-flex justify-content-center w-100">
        <input
          type="file"
          accept="image/*"
          className="d-none"
          id="imagen"
          onChange={handleImageChange}
        />
        <div
          className="input-data flex-grow-1 position-relative"
          style={{
            height: "45px",
            display: "flex",
            alignItems: "center",
            border: "1px solid #ced4da",
            borderRadius: "5px",
            backgroundColor: "#fff",
            minWidth: "320px",
            overflow: "hidden",
            paddingLeft: "130px",
            textOverflow: "ellipsis",
          }}
        >
          <label
            htmlFor="imagen"
            className={`btn ${imagePreview ? "btn-success" : "btn-primary"} mb-0 position-absolute`}
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              left: "0",
              width: "120px",
              borderRadius: "5px 0 0 5px",
              fontSize: "14px",
            }}
          >
            {imageLoading ? <Spinner animation="border" size="sm" /> : "Cargar"}
          </label>
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              paddingLeft: "10px",
            }}
          >
            {imageLoading ? (
              <>
                <Spinner animation="border" size="sm" /> Cargando...
              </>
            ) : imageName ? (
              imageName
            ) : (
              "Seleccionar archivo"
            )}
          </span>
        </div>
      </div>

      {imagePreview && (
        <div className="d-flex justify-content-center mt-3">
          <img
            src={imagePreview}
            alt="Preview"
            className="img-fluid rounded shadow"
            style={{
              width: "100%",
              maxWidth: "300px",
              height: "200px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
