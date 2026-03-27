import React from 'react';
import "../../../styles/home/filtrosAvanzados.css";

const FiltrosAvanzados = ({ 
    tipoProducto, 
    filtros, 
    onCambioFiltro, 
    onLimpiarFiltros,
    coloresDisponibles,
    materialesDisponibles,
    publicosDisponibles,
    mostrar,
    isMobile,
    cargando = false
}) => {
    
    if (!mostrar) return null;

    const esCalzado = tipoProducto === 'calzado';
    const esBolso = tipoProducto === 'bolsos';

    return (
        <div className={`filtros-avanzados ${isMobile ? 'filtros-mobile' : ''}`}>
            <div className="filtros-header">
                <h4>Filtros avanzados</h4>
                <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={onLimpiarFiltros}
                    type="button"
                >
                    <i className="bi bi-eraser"></i> Limpiar filtros
                </button>
            </div>

            <div className="filtros-grid">
                {/* FILTRO DE PRECIO */}
                <div className="filtro-grupo">
                    <label className="filtro-label">Precio</label>
                    <div className="precio-inputs">
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Mín"
                            value={filtros.precioMin}
                            onChange={(e) => onCambioFiltro('precioMin', e.target.value)}
                            min="0"
                        />
                        <span className="precio-separador">-</span>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Máx"
                            value={filtros.precioMax}
                            onChange={(e) => onCambioFiltro('precioMax', e.target.value)}
                            min="0"
                        />
                    </div>
                </div>


                {/* FILTRO DE MATERIAL */}
                {materialesDisponibles.length > 0 && (
                    <div className="filtro-grupo">
                        <label className="filtro-label">Material</label>
                        <select
                            className="form-select form-select-sm"
                            value={filtros.material}
                            onChange={(e) => onCambioFiltro('material', e.target.value)}
                        >
                            <option value="">Todos los materiales</option>
                            {materialesDisponibles.map((material, index) => (
                                <option key={index} value={material}>
                                    {material}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* FILTRO DE PÚBLICO */}
                {publicosDisponibles.length > 0 && (
                    <div className="filtro-grupo">
                        <label className="filtro-label">Género</label>
                        <select
                            className="form-select form-select-sm"
                            value={filtros.publico}
                            onChange={(e) => onCambioFiltro('publico', e.target.value)}
                        >
                            <option value="">Todos</option>
                            {publicosDisponibles.map((publico, index) => (
                                <option key={index} value={publico}>
                                    {publico}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* FILTRO ESPECÍFICO PARA BOLSOS */}
                {esBolso && (
                    <div className="filtro-grupo">
                        <label className="filtro-label">Tipo de bolso</label>
                        <select
                            className="form-select form-select-sm"
                            value={filtros.tipoBolso || ''}
                            onChange={(e) => onCambioFiltro('tipoBolso', e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="bandolera">Bandolera</option>
                            <option value="mochila">Mochila</option>
                            <option value="cartera">Cartera</option>
                            <option value="tote">Tote</option>
                            <option value="bolso">Bolso</option>
                        </select>
                    </div>
                )}
            </div>

            {/* FILTROS ACTIVOS */}
            {(filtros.precioMin || filtros.precioMax || filtros.color || 
              filtros.material || filtros.publico || filtros.tipoBolso) && (
                <div className="filtros-activos mt-3">
                    <small className="text-muted">Filtros activos:</small>
                    <div className="filtros-activos-lista">
                        {filtros.precioMin && (
                            <span className="filtro-activo-badge">
                                Desde ${filtros.precioMin}
                                <button onClick={() => onCambioFiltro('precioMin', '')}>×</button>
                            </span>
                        )}
                        {filtros.precioMax && (
                            <span className="filtro-activo-badge">
                                Hasta ${filtros.precioMax}
                                <button onClick={() => onCambioFiltro('precioMax', '')}>×</button>
                            </span>
                        )}
                        {filtros.material && (
                            <span className="filtro-activo-badge">
                                Material: {filtros.material}
                                <button onClick={() => onCambioFiltro('material', '')}>×</button>
                            </span>
                        )}
                        {filtros.publico && (
                            <span className="filtro-activo-badge">
                                {filtros.publico}
                                <button onClick={() => onCambioFiltro('publico', '')}>×</button>
                            </span>
                        )}
                        {filtros.tipoBolso && esBolso && (
                            <span className="filtro-activo-badge">
                                Tipo: {filtros.tipoBolso}
                                <button onClick={() => onCambioFiltro('tipoBolso', '')}>×</button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FiltrosAvanzados;