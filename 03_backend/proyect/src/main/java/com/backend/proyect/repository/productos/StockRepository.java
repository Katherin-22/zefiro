package com.backend.proyect.repository.productos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.backend.proyect.dto.productos.ColorProjection;
import com.backend.proyect.dto.productos.StockGeneralProjection;
import com.backend.proyect.dto.productos.VariacionProjection;
import com.backend.proyect.model.productos.Stock;

public interface StockRepository extends JpaRepository<Stock,Integer>{

    List<Stock> findByProductoIdProducto(Integer idProducto);

    @Query(value = """
    SELECT
        p.idProducto,
        p.codigoReferencia,
        p.nombreProducto,
        p.descripcion,
        tp.nombreTipoProducto,
        tpub.nombrePublico,
        c.nombreCategoria,
        m.nombreMaterial,
        p.estadoProducto AS activo,
        GROUP_CONCAT(DISTINCT v.nombre SEPARATOR ', ') AS variaciones,
        SUM(s.stockActual) AS stockActual,
        p.precio
    FROM Producto p
    LEFT JOIN TipoProducto tp ON tp.idTipoProducto = p.idCategoria
    LEFT JOIN Categoria c ON c.idCategoria = p.idCategoria
    LEFT JOIN Material m ON m.idMaterial = p.idMaterial
    LEFT JOIN TipoPublico tpub ON tpub.idPublico = p.idPublico
    LEFT JOIN Stock s ON s.idProducto = p.idProducto
    LEFT JOIN Variacion v ON v.idVariacion = s.idVariacion
    LEFT JOIN Color col ON col.idColor = s.idColor
    GROUP BY p.idProducto, p.codigoReferencia, p.nombreProducto, p.descripcion, 
            tp.nombreTipoProducto, tpub.nombrePublico, c.nombreCategoria, 
            m.nombreMaterial, p.estadoProducto, p.precio
    ORDER BY p.nombreProducto ASC;
    """, nativeQuery = true)
    List<StockGeneralProjection> obtenerStockAgrupado();

@Query(value = """
    SELECT DISTINCT c.idColor, c.nombreColor 
    FROM Stock s
    LEFT JOIN Color c ON c.idColor = s.idColor
    WHERE s.idProducto = ?1 AND s.stockActual > 0
    ORDER BY c.nombreColor
""", nativeQuery = true)
List<ColorProjection> findColoresByProducto(Integer idProducto);

@Query(value = """
        SELECT v.idVariacion, v.nombre, s.stockActual
        FROM Stock s
        LEFT JOIN Variacion v ON v.idVariacion = s.idVariacion
        WHERE s.idProducto = ?1 
        AND s.idColor = ?2 
        AND s.stockActual > 0
        ORDER BY v.nombre
""", nativeQuery = true)
List<VariacionProjection> findTallasByProductoAndColor(Integer idProducto, Integer idColor);
}
