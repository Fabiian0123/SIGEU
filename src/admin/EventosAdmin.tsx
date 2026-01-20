import React from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

const EventosAdmin: React.FC = () => {
  return (
    <div className="p-4">
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>..</th>
            <th>..</th>
            <th>..</th>
            <th>..</th>
            <th style={{ width: "140px" }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>1</td>
            <td>Semana académica</td>
            <td>2026-02-10</td>
            <td>2026-02-12</td>
            <td>Activo</td>
            <td>
              <Button size="sm" variant="outline-primary" className="me-2">
                Ver
              </Button>
              <Button size="sm" variant="outline-danger">
                Eliminar
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>

    </div>
  );
};

export default EventosAdmin;
