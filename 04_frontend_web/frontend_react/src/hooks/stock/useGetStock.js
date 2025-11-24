import { useEffect, useState } from "react";
import { getStock } from "../../services/administrador/StockService";

export const useGetStock = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStock()
      .then((res) => {
        console.log("✅ Respuesta de la API:", res);
        console.log("📦 Datos recibidos:", res.data);
        
        // Verifica que res.data sea un array
        if (Array.isArray(res.data)) {
          setStock(res.data);
        } else {
          console.error("❌ La respuesta no es un array:", res.data);
          setError("Formato de datos incorrecto");
          setStock([]);
        }
      })
      .catch((err) => {
        console.error("🚨 Error al cargar stock:", err);
        setError("Error al cargar los productos");
        setStock([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { stock, loading, error };
};