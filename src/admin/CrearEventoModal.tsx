import React from "react";
import { Modal, Button } from "react-bootstrap";

interface Props {
  show: boolean;
  onHide: () => void;
}

const CrearEventoModal: React.FC<Props> = ({ show, onHide }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Crear evento</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>Formulario de creación de evento</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary">
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CrearEventoModal;
