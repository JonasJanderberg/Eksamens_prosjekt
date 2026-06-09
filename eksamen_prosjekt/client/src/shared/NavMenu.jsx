import React from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavMenu = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">IT-Support</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Hjem</Nav.Link>
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/SupportPage">Send henvendelse</Nav.Link>

            <NavDropdown title="Admin" id="admin-dropdown">
              <NavDropdown.Item as={Link} to="/AdminPage">Henvendelser</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/adbrukere">AD-brukere</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/evaluation">Evaluering</NavDropdown.Item>
            </NavDropdown>
          </Nav>

          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/profil">Min profil</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavMenu;