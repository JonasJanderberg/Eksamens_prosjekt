import './App.css';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import HomePage from './home/HomePage';
import NavMenu from './shared/NavMenu';
import AdminPage from './admin/AdminPage';
import SupportPage from './support/SupportPage';
import DashboardPage from './dashboard/DashboardPage';
import ProfilPage from './profil/ProfilPage';
import ADBrukerePage from './adbrukere/AdbrukerePage';
import EvaluationPage from './Evaluation/EvaluationPage';

function Footer() {
  const location = useLocation();
  if (location.pathname !== "/") return null;

  return (
    <footer style={{
      backgroundColor: "#212529",
      color: "#adb5bd",
      padding: "2rem 0",
      marginTop: "3rem",
    }}>
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h6 className="text-white">IT-Supportportalen</h6>
            <p style={{ fontSize: "0.875rem" }}>
              Et system for håndtering av IT-henvendelser og Active Directory-administrasjon.
            </p>
          </Col>

          <Col md={4} className="mb-3">
            <h6 className="text-white">Hurtiglenker</h6>
            <ul className="list-unstyled" style={{ fontSize: "0.875rem" }}>
              <li><Link to="/" style={{ color: "#adb5bd", textDecoration: "none" }}>Hjem</Link></li>
              <li><Link to="/SupportPage" style={{ color: "#adb5bd", textDecoration: "none" }}>Send henvendelse</Link></li>
              <li><Link to="/adbrukere" style={{ color: "#adb5bd", textDecoration: "none" }}>AD-brukere</Link></li>
              <li><Link to="/dashboard" style={{ color: "#adb5bd", textDecoration: "none" }}>Dashboard</Link></li>
            </ul>
          </Col>

          <Col md={4} className="mb-3">
            <h6 className="text-white">Kontakt</h6>
            <p style={{ fontSize: "0.875rem", marginBottom: 0 }}>
              support@bjornholt.local<br />
              Bjornholt videregående skole<br />
              IT-avdelingen
            </p>
          </Col>
        </Row>

        <hr style={{ borderColor: "#495057" }} />
        <p className="mb-0" style={{ fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} Bjornholt IT-Support. Alle rettigheter forbeholdt.
        </p>
      </Container>
    </footer>
  );
}

function App() {
  return (
    <>
      <NavMenu />

      <Container>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/AdminPage" element={<AdminPage />} />
          <Route path="/SupportPage" element={<SupportPage />} />
          <Route path="/adbrukere" element={<ADBrukerePage />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
        </Routes>
      </Container>

      <Footer />
    </>
  );
}

export default App;
