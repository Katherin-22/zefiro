package com.backend.proyect.model.pedido;



public enum EstadoPedido {
    Pendiente,      // ← Exactamente como en la BD
    Procesando,     // ← Nota: con guión bajo o sin espacio?
    Entregado       // ← Verifica el valor exacto en BD
}