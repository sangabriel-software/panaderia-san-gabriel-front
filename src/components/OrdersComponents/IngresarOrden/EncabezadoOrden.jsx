// EncabezadoOrden.js
import React from "react";
import { Card, Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EncabezadoOrden = ({ register, errors, setValue, watch, control, sucursales, tomorrow }) => {
  const turnoValue = watch("turno");

  return (
    <Card className="shadow-lg border-0 mb-4 bg-gradient-primary" style={{ borderRadius: "15px" }}>
      <Card.Body>
        <Row className="g-3 align-items-center">
          <Col md={4} className="border-end border-light">
            <Form.Group>
              <label className="form-label text-muted small mb-1">SUCURSAL</label>
              <Form.Select
                {...register("sucursal", { required: "Seleccione sucursal" })}
                className="border-primary"
              >
                <option value="">Seleccione sucursal</option>
                {sucursales.map((s) => (
                  <option key={s.idSucursal} value={s.idSucursal}>{s.nombreSucursal}</option>
                ))}
              </Form.Select>
              {errors.sucursal && <span className="text-danger">{errors.sucursal.message}</span>}
            </Form.Group>
          </Col>

          <Col md={4} className="ps-5">
            <Form.Group>
              <label className="form-label text-muted small mb-1">TURNO</label>
              <InputGroup>
                <Button variant={turnoValue === "AM" ? "primary" : "outline-primary"} onClick={() => setValue("turno", "AM")}>
                  AM
                </Button>
                <Button variant={turnoValue === "PM" ? "primary" : "outline-primary"} onClick={() => setValue("turno", "PM")}>
                  PM
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <label className="form-label text-muted small mb-1">FECHA DE PRODUCCIÓN</label>
              <Controller
                control={control}
                name="fechaAProducir"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    selected={field.value}
                    onChange={field.onChange}
                    className="form-control border-primary"
                    minDate={tomorrow}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/aaaa"
                  />
                )}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="g-3 align-items-center mt-3">
          <Col md={4} className="border-end border-light">
            <Form.Group>
              <label className="form-label text-muted small mb-1">NOMBRE DEL PANADERO</label>
              <Form.Control
                type="text"
                placeholder="Ej. María Pérez"
                {...register("nombrePanadero", { required: "El nombre del panadero es requerido" })}
                className="border-primary"
              />
              {errors.nombrePanadero && <span className="text-danger">{errors.nombrePanadero.message}</span>}
            </Form.Group>
          </Col>

          <Col md={2}> </Col>

          <Col md={6}>
            <Form.Group>
              <label className="form-label text-muted small mb-1">USUARIO</label>
              <span className="badge bg-success ms-2">admin</span>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default EncabezadoOrden;
