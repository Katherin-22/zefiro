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

    @Query("SELECT s FROM Stock s JOIN FETCH s.producto")
    List<Stock> findAllWithProducto();

    @Query(value = """
SELECT 
    p.idProducto,                    -- ✅ Producto es el principal
    p.codigoReferencia,
    p.nombreProducto,
    p.descripcion,
    p.precio,
    p.estadoProducto,
    c.nombreCategoria,
    tp.nombreTipoProducto,
    m.nombreMaterial,
    tpub.nombrePublico,
    -- Datos del stock (pueden ser NULL si no hay stock)
    s.idStock,
    s.stockActual,
    s.stockMinimo,
    col.nombreColor,
    v.nombre AS nombreTalla
FROM Producto p                          
LEFT JOIN Categoria c ON p.idCategoria = c.idCategoria
LEFT JOIN TipoProducto tp ON c.idTipoProducto = tp.idTipoProducto
LEFT JOIN Material m ON p.idMaterial = m.idMaterial
LEFT JOIN TipoPublico tpub ON p.idPublico = tpub.idPublico
LEFT JOIN Stock s ON s.idProducto = p.idProducto    -- LEFT JOIN para incluir productos sin stock
LEFT JOIN Color col ON s.idColor = col.idColor
LEFT JOIN Variacion v ON s.idVariacion = v.idVariacion
ORDER BY p.nombreProducto ASC, col.nombreColor ASC, v.nombre ASC;
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
