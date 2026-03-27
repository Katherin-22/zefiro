import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {createStock} from "../../../services/administrador/StockService";

import {useGetColor} from "../../../hooks/color/useGetColor";
import {useGetVariacionPorProducto} from "../../../hooks/stock/useVariacionStock";

import MenuAdmin from "../../../layouts/administrador/menuAdmin";
import "../../../styles/administrador/inventario.css";
import "../../../styles/administrador/gestion_producto.css";
import "../../../styles/administrador/formularios-admin.css"

export default function CreateStock() {
{/*navigate=useNavigate():Sirve para moverte entre páginas desde el código */}
{/*navigate("/"); // me lleva a la página principal */}

    const { idProducto } = useParams();

    let navigate=useNavigate();

        const [stock, setStock]=useState({ 
        stockMinimo:"",
        stockActual: "",
        idColor: "",
        idVariacion: "",
    });

    const [loading, setLoad] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const { stockMinimo, stockActual } = stock;

    const { color } = useGetColor();
    const { variacionStock } = useGetVariacionPorProducto(idProducto);

    const handleCreateStock = async (idProducto, stock) => {
        setLoad(true); // paso 1: activar "cargando"
        try {
        await createStock(idProducto, stock); // paso 2: enviar datos al backend
        setSuccess(true);        // paso 3: si todo ok → marcar éxito
        navigate(`/stock/producto/${idProducto}`)
        } catch (error) {
        console.error("Error al crear la Stock:", error);

        // Verifica si el backend envió un mensaje
        if (error.response && error.response.data && error.response.data.errorMessage) {
        alert("⚠️ " + error.response.data.errorMessage);
        } else {
        alert("⚠️ Error desconocido al crear la Stock");
        }
        setSuccess(false);      // si falla → marcar como no exitoso
        } finally {
        setLoad(false);         // paso 4: quitar "cargando"
        }
    };

    const onInputChange=(e)=>{
        setStock({...stock, [e.target.name]: e.target.value});
    };

    const onSubmit=async (e)=>{
        e.preventDefault();
        await handleCreateStock(idProducto, stock); // manda datos al backend
    }

    {success && (
        console.log("stock creado con éxito.")
    )}    

  return (

<div className="main-content">
    <nav>
        <MenuAdmin />
    </nav>
      <div className="container-fluid" id='container-admin'>
    <div className="header">    
        <div className="row custom-header">
            <div className="col-12 d-flex align-items-center justify-content-between px-4 w-100">
                <h1 className="mb-0">Registrar Stock</h1>
                <a href="./INVENTARIO(PRINCIPAL).HTML" className="btn btn-light custom-btn-exit">
                    <img src="../img/caret-left.png" alt=""/>
                </a>
            </div>
        </div>
    </div>  

    <form className="container py-4" onSubmit={(e)=> onSubmit(e)}> 
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">

            <div className="col">
                <label className="form-label required">Stock minimo</label>
                <input type="number" 
                name="stockMinimo" 
                placeholder="Ingresa el stock minimo del producto"
                className="form-control"
                required 
                value={stockMinimo} 
                onChange={(e)=>onInputChange(e)}
                />
            </div>

            <div className="col">
                <label className="form-label required">Stock Actual</label>
                <input type="number" 
                name="stockActual" 
                placeholder="Ingresa el stock actual del producto"
                className="form-control"
                required 
                value={stockActual} 
                onChange={(e)=>onInputChange(e)}
                />
            </div>

            <div className="col">
                <label className="form-label required">Color</label>
                <select name="idColor" value={stock.idColor} onChange={(e)=>onInputChange(e)} className="form-select" required>
                <option value="">-- Selecciona una opción --</option>
                {color?.map((color) => (
                <option key={color.idColor} value={color.idColor}>
                    {color.nombreColor}
                </option>
                ))}
                </select>
            </div>

            <div className="col">
                <label className="form-label required">Medidas</label>
                <select name="idVariacion" value={stock.idVariacion} onChange={(e)=>onInputChange(e)} className="form-select" required>
                <option value="">-- Selecciona una opción --</option>
                {variacionStock?.map((variacion) => (
                <option key={variacion.idVariacion} value={variacion.idVariacion}>
                    {variacion.nombre}
                </option>
                ))}
                </select>
            </div>

        </div>

<div className="row row-cols-1">
{/* esto es para enviar el formulario*/} 
      
            <button type="submit" className="btn btn-outline-primary" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
            </button>
        
           {/* esto es para cancelar el formulario*/} 
            <Link to={`/stock/producto/${idProducto}`} className="btn btn-outline-danger mx-2">
                Cancel
            </Link>
        </div>
    </form>
</div>
</div>

  )
}