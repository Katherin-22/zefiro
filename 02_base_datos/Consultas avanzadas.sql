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
    ANY_VALUE(p.codigoReferencia) AS codigoReferencia,
    ANY_VALUE(p.nombreProducto) AS nombreProducto,
    ANY_VALUE(p.descripcion) AS descripcion,
    ANY_VALUE(tp.nombreTipoProducto) AS nombreTipoProducto, 
	ANY_VALUE(tpb.nombrePublico) AS nombrePublico, 
    ANY_VALUE(cat.nombreCategoria) AS nombreCategoria, 
    ANY_VALUE(mat.nombreMaterial) AS nombreMaterial, 
    ANY_VALUE(p.precio) AS precio,
    GROUP_CONCAT(DISTINCT v.nombre SEPARATOR ', ') AS nombre,
    GROUP_CONCAT(DISTINCT c.nombreColor SEPARATOR ', ') AS nombreColor,
    SUM(s.stockActual) AS stockActual,
    ANY_VALUE(p.estadoProducto) AS estadoProducto
FROM Stock s
JOIN Producto p ON s.idProducto = p.idProducto
JOIN Categoria cat ON p.idCategoria = cat.idCategoria
JOIN TipoProducto tp ON cat.idTipoProducto = tp.idTipoProducto
JOIN Material mat ON p.idMaterial = mat.idMaterial
JOIN TipoPublico tpb ON p.idPublico = tpb.idPublico
LEFT JOIN Variacion v ON v.idVariacion = s.idVariacion
LEFT JOIN Color c ON c.idColor = s.idColor
GROUP BY p.idProducto
ORDER BY p.nombreProducto ASC;

--  Pone el precio del producto en precioUnitario que esta en DetalleCarrito
DELIMITER //

CREATE TRIGGER set_precio_detalle_carrito
BEFORE INSERT ON DetalleCarrito
FOR EACH ROW
BEGIN
    DECLARE precio_producto DOUBLE;
    
    -- SIEMPRE obtener el precio del producto, ignorando cualquier valor proporcionado
    SELECT p.precio INTO precio_producto
    FROM Producto p
    INNER JOIN Stock s ON p.idProducto = s.idProducto
    WHERE s.idStock = NEW.idStock;
    
    -- Asignar el precio del producto
    SET NEW.precioUnitario = precio_producto;
    
    -- Si no se encuentra el producto, puedes manejar el error
    IF precio_producto IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Producto no encontrado para el stock especificado';
    END IF;
END//

DELIMITER ;

-- Para la actualizacion del total del carrito

DELIMITER //

CREATE PROCEDURE ActualizarTotalCarrito(IN p_idCarrito INT)
BEGIN
    DECLARE v_total Double;
    
    -- Calcular el total sumando todos los subtotales
    SELECT COALESCE(SUM(subtotal)) INTO v_total
    FROM DetalleCarrito
    WHERE idCarrito = p_idCarrito;
    
    -- Actualizar el carrito
    UPDATE Carrito 
    SET total = v_total
    WHERE idCarrito = p_idCarrito;
END//

DELIMITER ;

-- Trigger para INSERT
DELIMITER //
CREATE TRIGGER trig_detalle_insert
AFTER INSERT ON DetalleCarrito
FOR EACH ROW
BEGIN
    CALL ActualizarTotalCarrito(NEW.idCarrito);
END//
DELIMITER ;

-- Trigger para UPDATE
DELIMITER //
CREATE TRIGGER trig_detalle_update
AFTER UPDATE ON DetalleCarrito
FOR EACH ROW
BEGIN
    -- Actualizar el carrito nuevo
    CALL ActualizarTotalCarrito(NEW.idCarrito);
    
    -- Si cambió de carrito, actualizar también el anterior
    IF OLD.idCarrito != NEW.idCarrito THEN
        CALL ActualizarTotalCarrito(OLD.idCarrito);
    END IF;
END//
DELIMITER ;

-- Trigger para DELETE
DELIMITER //
CREATE TRIGGER trig_detalle_delete
AFTER DELETE ON DetalleCarrito
FOR EACH ROW
BEGIN
    CALL ActualizarTotalCarrito(OLD.idCarrito);
END//
DELIMITER ;

