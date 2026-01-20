import React, { useState } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";

const HeaderUsers: React.FC = () => {
    const [modalShow, setModalShow] = useState(false);

    return (
        <>
            <Navbar bg="white" className="border-bottom" fixed="top">
                <Container fluid className="justify-content-center position-relative">

                    <Navbar.Brand className="fw-semibold fs-5 m-0">
                        Tus eventos
                    </Navbar.Brand>
                </Container>
            </Navbar>

        </>
    );
};

export default HeaderUsers;