import React from "react";
import { Link } from "react-router-dom";
import "../../styles/home/footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-4 footer-container" id="footer-container">
      <div className="container-fluid">
        <div className="row justify-content-center">
          
          {/* CONTENIDO PRINCIPAL - TODO CENTRADO */}
          <div className="col-12 mb-4">
            <div className="row g-4 justify-content-center">
              
              {/* SOBRE NOSOTROS - CENTRADO */}
              <div className="col-12 col-md-6 col-lg-4 footer-about d-flex flex-column align-items-center">
                <h4 className="fw-bold fs-5 mb-3 text-center" id="sobre-nosotros">
                  Sobre Nosotros
                </h4>
                <ul className="list-unstyled mb-0 text-center">
                  <li className="mb-2">
                    <Link
                      to="#"
                      className="text-white text-decoration-none footer-link"
                    >
                      Innovation Fusion
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/nosotros"
                      className="text-white text-decoration-none footer-link"
                    >
                      Nuestra historia
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/mision"
                      className="text-white text-decoration-none footer-link"
                    >
                      Misión y visión
                    </Link>
                  </li>
                </ul>
              </div>

              {/* CONTACTO - CENTRADO */}
              <div className="col-12 col-md-6 col-lg-4 footer-contact d-flex flex-column align-items-center">
                <h4 className="fw-bold fs-5 mb-3 text-center" id="contacto-footer">
                  Contacto
                </h4>
                <ul className="list-unstyled mb-0 text-center">
                  <li className="mb-2">
                    <a
                      href="mailto:innovationFusion@gmail.com"
                      className="text-white text-decoration-none footer-link d-flex align-items-center justify-content-center"
                    >
                      <i className="bi bi-envelope me-2"></i>
                      innovationFusion@gmail.com
                    </a>
                  </li>
                  <li className="mb-2">
                    <a
                      href="tel:+573655462742"
                      className="text-white text-decoration-none footer-link d-flex align-items-center justify-content-center"
                    >
                      <i className="bi bi-telephone me-2"></i>
                      +57 365 546 2742
                    </a>
                  </li>
                  <li>
                    <span className="text-white d-flex align-items-center justify-content-center">
                      <i className="bi bi-geo-alt me-2"></i>
                      Colombia
                    </span>
                  </li>
                </ul>
              </div>

              {/* REDES SOCIALES - CENTRADO */}
              <div className="col-12 col-lg-4 footer-social d-flex flex-column align-items-center">
                <h4 className="fw-bold fs-5 mb-3 text-center" id="redes-footer">
                  Síguenos
                </h4>
                <ul className="list-unstyled mb-0 text-center">
                  <li className="mb-3">
                    <div className="d-flex justify-content-center">
                      <a
                        href="#"
                        className="text-white text-decoration-none mx-2 footer-social-link d-flex align-items-center justify-content-center"
                        style={{width: '40px', height: '40px'}}
                      >
                        <i className="bi bi-facebook fs-5"></i>
                      </a>
                      <a
                        href="#"
                        className="text-white text-decoration-none mx-2 footer-social-link d-flex align-items-center justify-content-center"
                        style={{width: '40px', height: '40px'}}
                      >
                        <i className="bi bi-whatsapp fs-5"></i>
                      </a>
                      <a
                        href="#"
                        className="text-white text-decoration-none mx-2 footer-social-link d-flex align-items-center justify-content-center"
                        style={{width: '40px', height: '40px'}}
                      >
                        <i className="bi bi-instagram fs-5"></i>
                      </a>
                      <a
                        href="#"
                        className="text-white text-decoration-none mx-2 footer-social-link d-flex align-items-center justify-content-center"
                        style={{width: '40px', height: '40px'}}
                      >
                        <i className="bi bi-tiktok fs-5"></i>
                      </a>
                    </div>
                  </li>
                  <li>
                    <Link
                      to="/newsletter"
                      className="text-white text-decoration-none footer-link d-flex align-items-center justify-content-center"
                    >
                      <i className="bi bi-envelope-paper me-2"></i>
                      Suscríbete al newsletter
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* DERECHOS RESERVADOS - CENTRADO */}
          <div className="col-12 footer-rights">
            <hr className="my-3 bg-light opacity-25 mx-auto" style={{maxWidth: '90%'}} />
            <div className="row justify-content-center">
              <div className="col-12 col-md-8 col-lg-6">
                <p className="text-center mb-2 mb-md-0 footer-text">
                  <i className="bi bi-c-circle me-1"></i>
                  {currentYear} Innovation Fusion. Todos los derechos reservados.
                </p>
              </div>
              <div className="col-12 col-md-8 col-lg-6">
                <div className="d-flex flex-wrap justify-content-center">
                  <Link
                    to="/terminos"
                    className="text-white text-decoration-none mx-2 mb-1 footer-link"
                  >
                    Términos
                  </Link>
                  <Link
                    to="/privacidad"
                    className="text-white text-decoration-none mx-2 mb-1 footer-link"
                  >
                    Privacidad
                  </Link>
                  <Link
                    to="/cookies"
                    className="text-white text-decoration-none mx-2 mb-1 footer-link"
                  >
                    Cookies
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;