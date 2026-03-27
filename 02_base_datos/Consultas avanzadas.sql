								-- cosultas avanzadas:
-- -----------------------------------------------------
-- Disparadores
-- -----------------------------------------------------
-- trigger para que cuando se cree un producto, se guarde en un stoc vacio
DELIMITER $$

CREATE TRIGGER trg_producto_after_insert
AFTER INSERT ON Producto
FOR EACH ROW
BEGIN
    INSERT INTO Stock (stockMinimo, stockActual, idColor, idVariacion, idProducto)
    VALUES (0, 0, Null, Null, NEW.idProducto);
END$$

DELIMITER ;

-- consulta para agrupar el stok segun el idProducto
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
