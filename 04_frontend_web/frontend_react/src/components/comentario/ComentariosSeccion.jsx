// components/comentario/ComentariosSeccion.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../styles/home/comentarios.css';

const ComentariosSeccion = ({
  producto,
  usuario,
  comentarios,
  estadisticas,
  comentarioUsuario,
  loadingComentarios,
  enviandoComentario,
  error,
  onCreateComentario,
  onDeleteComentario,
  navigate
}) => {
  const [nuevoComentario, setNuevoComentario] = useState({
    comentario: "",
    calificacion: 5
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Efecto para debug
  useEffect(() => {
    console.log('🔍 ComentariosSeccion Debug:', {
      usuarioAutenticado: usuario.isAuthenticated,
      usuarioId: usuario.id,
      comentarioUsuario: comentarioUsuario,
      tieneComentarioUsuario: !!comentarioUsuario,
      mostrarFormulario: mostrarFormulario,
      totalComentarios: comentarios?.length
    });
    
    setDebugInfo(`Usuario: ${usuario.isAuthenticated ? 'Autenticado' : 'No autenticado'}, 
                  ComentarioUsuario: ${comentarioUsuario ? 'Sí' : 'No'}, 
                  MostrarForm: ${mostrarFormulario}`);
  }, [usuario, comentarioUsuario, mostrarFormulario, comentarios]);

  // Renderizar estrellas de calificación
  const renderEstrellas = (calificacion, size = "fs-5") => {
    if (!calificacion || calificacion < 0 || calificacion > 5) {
      calificacion = 0;
    }
    
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`bi ${index < calificacion ? 'bi-star-fill' : 'bi-star'} text-warning ${size}`}
      ></i>
    ));
  };

  // Manejar envío de comentario
  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    
    console.log('📤 Intentando enviar comentario...');
    
    if (!usuario.isAuthenticated) {
      alert("Por favor inicia sesión para comentar");
      navigate('/loginpage');
      return;
    }
    
    if (!nuevoComentario.comentario.trim() || nuevoComentario.comentario.trim().length < 10) {
      alert("El comentario debe tener al menos 10 caracteres");
      return;
    }
    
    try {
      const comentarioData = {
        idProducto: producto.idProducto,
        comentario: nuevoComentario.comentario.trim(),
        calificacion: nuevoComentario.calificacion
      };
      
      console.log('📝 Datos del comentario:', comentarioData);
      
      // NOTA: Se pasa solo comentarioData, no (usuario.id, comentarioData)
      await onCreateComentario(comentarioData);
      
      // Limpiar formulario
      setNuevoComentario({
        comentario: "",
        calificacion: 5
      });
      setMostrarFormulario(false);
      
      alert("¡Comentario publicado exitosamente!");
      
    } catch (error) {
      console.error("❌ Error al enviar comentario:", error);
      alert(error.message || error.response?.data?.message || "Error al publicar comentario");
    }
  };

  // Manejar eliminación de comentario
  const handleEliminarComentario = async (idComentario) => {
    if (!window.confirm("¿Estás seguro de eliminar tu comentario?")) return;
    
    try {
      console.log('🗑️ Eliminando comentario:', idComentario);
      // NOTA: Se pasa solo idComentario, no (usuario.id, idComentario, producto.idProducto)
      await onDeleteComentario(idComentario);
      alert("Comentario eliminado exitosamente");
    } catch (error) {
      console.error("❌ Error al eliminar comentario:", error);
      alert(error.message || "Error al eliminar comentario");
    }
  };

  // Formatear fecha
  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  // Función para mostrar/ocultar formulario
  const toggleFormulario = () => {
    if (!usuario.isAuthenticated) {
      alert("Por favor inicia sesión para comentar");
      navigate('/loginpage');
      return;
    }
    setMostrarFormulario(!mostrarFormulario);
  };

  // Debug: Botón para ver estado
  const DebugButton = () => (
    <div className="debug-info mt-2 p-2 bg-light border rounded">
      <small className="text-muted">
        <strong>Debug:</strong> {debugInfo}
      </small>
      <button 
        className="btn btn-sm btn-outline-secondary ms-2"
        onClick={() => console.log('Estado completo:', { 
          usuario, 
          comentarioUsuario, 
          mostrarFormulario,
          comentariosCount: comentarios?.length 
        })}
      >
        Console Log
      </button>
    </div>
  );

  return (
    <div className="producto-comentarios-fila mt-5" id="producto-comentarios-fila">
      <div className="producto-seccion-comentarios" id="producto-seccion-comentarios">
        {/* Cabecera con estadísticas */}
        <div className="producto-header-comentarios mb-4">
          <h2 className="producto-titulo-comentarios text-center mb-3">
            <i className="bi bi-chat-dots me-2"></i>
            Opiniones del producto
          </h2>
          
          {/* Estadísticas */}
          <div className="estadisticas-comentarios text-center mb-4">
            <div className="d-flex justify-content-center align-items-center gap-4">
              <div className="promedio-calificacion">
                <div className="display-4 fw-bold">
                  {estadisticas?.promedioCalificacion?.toFixed(1) || '0.0'}
                </div>
                <div className="estrellas-promedio mb-2">
                  {renderEstrellas(Math.round(estadisticas?.promedioCalificacion || 0), "fs-4")}
                </div>
                <small className="text-muted">de 5 estrellas</small>
              </div>
              <div className="total-comentarios">
                <div className="h3 fw-bold">{estadisticas?.totalComentarios || 0}</div>
                <small className="text-muted">comentarios</small>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* DEBUG: Información de estado (solo desarrollo) */}
        {process.env.NODE_ENV === 'development' && <DebugButton />}

        {/* Botón para agregar comentario (si no tiene) - MODIFICADO */}
        {usuario.isAuthenticated && !comentarioUsuario && !mostrarFormulario && (
          <div className="text-center mb-4">
            <button
              className="btn btn-primary btn-lg"
              onClick={toggleFormulario}
              id="btn-agregar-comentario"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Agregar tu opinión
            </button>
            <p className="text-muted mt-2">
              <small>¿Tienes este producto? Comparte tu experiencia.</small>
            </p>
          </div>
        )}

        {/* Mensaje si ya tiene comentario */}
        {usuario.isAuthenticated && comentarioUsuario && !mostrarFormulario && (
          <div className="alert alert-info mb-4">
            <i className="bi bi-info-circle me-2"></i>
            Ya has publicado una opinión sobre este producto.
          </div>
        )}

        {/* Formulario para comentar - MODIFICADO */}
        {usuario.isAuthenticated && !comentarioUsuario && mostrarFormulario && (
          <form onSubmit={handleEnviarComentario} className="producto-form-comentario mb-5">
            <div className="card border-primary">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-chat-square-text me-2"></i>
                  Escribe tu opinión sobre "{producto.nombreProducto}"
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light"
                  onClick={() => setMostrarFormulario(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Califica este producto <span className="text-danger">*</span>
                  </label>
                  <div className="calificacion-estrellas mb-3">
                    <div className="d-flex align-items-center">
                      {[1, 2, 3, 4, 5].map((estrellas) => (
                        <button
                          key={estrellas}
                          type="button"
                          className={`btn btn-link p-0 me-2 ${nuevoComentario.calificacion >= estrellas ? 'text-warning' : 'text-muted'}`}
                          onClick={() => setNuevoComentario({...nuevoComentario, calificacion: estrellas})}
                          title={`${estrellas} estrella${estrellas > 1 ? 's' : ''}`}
                        >
                          <i className="bi bi-star-fill fs-2"></i>
                        </button>
                      ))}
                      <span className="ms-2">
                        <strong>{nuevoComentario.calificacion} de 5 estrellas</strong>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Tu opinión <span className="text-danger">*</span>
                  </label>
                  <textarea
                    value={nuevoComentario.comentario}
                    onChange={(e) => setNuevoComentario({...nuevoComentario, comentario: e.target.value})}
                    placeholder="Comparte tu experiencia con este producto. ¿Qué te gustó? ¿Qué no te gustó? ¿Recomendarías este producto?"
                    className="form-control"
                    rows="4"
                    required
                    minLength={10}
                    maxLength={500}
                    id="textarea-comentario"
                  />
                  <div className="d-flex justify-content-between mt-1">
                    <small className={`text-${nuevoComentario.comentario.trim().length < 10 ? 'danger' : 'muted'}`}>
                      {nuevoComentario.comentario.trim().length < 10 
                        ? `Faltan ${10 - nuevoComentario.comentario.trim().length} caracteres` 
                        : 'Mínimo 10 caracteres ✓'}
                    </small>
                    <small className="text-muted">
                      {nuevoComentario.comentario.length}/500 caracteres
                    </small>
                  </div>
                </div>
                
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setNuevoComentario({ comentario: "", calificacion: 5 });
                    }}
                    disabled={enviandoComentario}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={enviandoComentario || nuevoComentario.comentario.trim().length < 10}
                    id="btn-publicar-comentario"
                  >
                    {enviandoComentario ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Publicando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Publicar comentario
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comentario del usuario actual - MEJORADO */}
        {usuario.isAuthenticated && comentarioUsuario && (
          <div className="comentario-usuario-actual mb-4">
            <div className="card border-success">
              <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">
                    <i className="bi bi-person-circle me-2"></i>
                    Tu opinión
                  </h6>
                  <small className="opacity-75">
                    Publicado el {formatFecha(comentarioUsuario.fechaComentario)}
                  </small>
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline-light"
                    onClick={() => handleEliminarComentario(comentarioUsuario.idComentario)}
                    title="Eliminar comentario"
                  >
                    <i className="bi bi-trash"></i> Eliminar
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="estrellas-calificacion me-3">
                    {renderEstrellas(comentarioUsuario.calificacion)}
                  </div>
                  <span className="badge bg-warning text-dark">
                    {comentarioUsuario.calificacion} de 5 estrellas
                  </span>
                </div>
                <p className="card-text">{comentarioUsuario.comentario}</p>
                {comentarioUsuario.fechaActualizacion && (
                  <small className="text-muted">
                    <i className="bi bi-pencil me-1"></i>
                    Editado el {formatFecha(comentarioUsuario.fechaActualizacion)}
                  </small>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lista de comentarios de otros usuarios */}
        <div className="producto-lista-comentarios mt-4">
          <h4 className="mb-4">
            <i className="bi bi-people me-2"></i>
            Opiniones de otros clientes 
            <span className="badge bg-secondary ms-2">
              {comentarios?.filter(c => !comentarioUsuario || c.idComentario !== comentarioUsuario.idComentario).length || 0}
            </span>
          </h4>
          
          {loadingComentarios ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando comentarios...</span>
              </div>
              <p className="mt-3 text-muted">Cargando opiniones...</p>
            </div>
          ) : comentarios && comentarios.length > 0 ? (
            <>
              <div className="row g-4">
                {comentarios
                  .filter(c => !comentarioUsuario || c.idComentario !== comentarioUsuario.idComentario)
                  .map((comentario) => (
                    <div key={comentario.idComentario} className="col-md-6 col-lg-4">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="fw-bold mb-1">
                                <i className="bi bi-person-circle me-1"></i>
                                {comentario.nombreUsuario || 'Anónimo'}
                              </h6>
                              <small className="text-muted">
                                {formatFecha(comentario.fechaComentario)}
                              </small>
                            </div>
                            <div className="estrellas-calificacion">
                              {renderEstrellas(comentario.calificacion, "fs-6")}
                            </div>
                          </div>
                          <p className="card-text">{comentario.comentario}</p>
                        </div>
                        <div className="card-footer bg-transparent border-top-0">
                          <small className="text-muted">
                            <i className="bi bi-hand-thumbs-up me-1"></i>
                            ¿Te resultó útil esta reseña?
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Paginación o ver más */}
              {comentarios.length > 6 && (
                <div className="text-center mt-4">
                  <button className="btn btn-outline-primary">
                    Ver más opiniones
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-chat-text text-muted fs-1 mb-3"></i>
              <h5 className="text-muted">No hay opiniones aún</h5>
              <p className="text-muted mb-0">
                {usuario.isAuthenticated 
                  ? 'Sé el primero en compartir tu experiencia con este producto'
                  : 'Inicia sesión para ser el primero en comentar'}
              </p>
              {!usuario.isAuthenticated && (
                <button 
                  className="btn btn-link mt-2"
                  onClick={() => navigate('/loginpage')}
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          )}
        </div>

        {/* Información para usuarios no autenticados */}
        {!usuario.isAuthenticated && (
          <div className="alert alert-warning mt-4">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle fs-4 me-3"></i>
              <div>
                <h6 className="mb-1">¿Quieres compartir tu opinión?</h6>
                <p className="mb-0">
                  Inicia sesión para comentar sobre este producto y ayudar a otros compradores.
                </p>
                <button 
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={() => navigate('/loginpage')}
                >
                  Iniciar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ComentariosSeccion.propTypes = {
  producto: PropTypes.shape({
    idProducto: PropTypes.number.isRequired,
    nombreProducto: PropTypes.string.isRequired
  }).isRequired,
  usuario: PropTypes.shape({
    isAuthenticated: PropTypes.bool.isRequired,
    id: PropTypes.number,
    data: PropTypes.object
  }).isRequired,
  comentarios: PropTypes.array,
  estadisticas: PropTypes.shape({
    promedioCalificacion: PropTypes.number,
    totalComentarios: PropTypes.number
  }),
  comentarioUsuario: PropTypes.object,
  loadingComentarios: PropTypes.bool,
  enviandoComentario: PropTypes.bool,
  error: PropTypes.string,
  onCreateComentario: PropTypes.func.isRequired,
  onDeleteComentario: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired
};

ComentariosSeccion.defaultProps = {
  comentarios: [],
  estadisticas: { promedioCalificacion: 0, totalComentarios: 0 },
  loadingComentarios: false,
  enviandoComentario: false
};

export default ComentariosSeccion;