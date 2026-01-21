import React, { useState } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import CrearEventoModal from "./CrearEventoModal";

const Header: React.FC = () => {
    const [modalShow, setModalShow] = useState(false);

    return (
        <>
            <Navbar bg="white" className="border-bottom" fixed="top">
                <Container fluid className="justify-content-center position-relative">

                    <Navbar.Brand className="fw-semibold fs-5 m-0">
                        Mis eventos
                    </Navbar.Brand>

                    <Button
                        variant="primary"
                        className="position-absolute end-0 me-3"
                        onClick={() => setModalShow(true)}
                    >
                        <FaPlus />
                    </Button>
                </Container>
            </Navbar>

            <CrearEventoModal
                show={modalShow}
                onHide={() => setModalShow(false)}
            />
        </>
    );
};

export default Header;



