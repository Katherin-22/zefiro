// services/comentario/comentarioService.jsx
import api_url from "../administrador/api";

class ComentarioService {
  // Crear nuevo comentario - VERSIÓN CON MÁS DEBUG
  async crearComentario(comentarioData) {
    console.log('🚀 INICIANDO crearComentario');
    console.log('📝 Datos recibidos:', comentarioData);
    
    try {
      // 1. Obtener datos de autenticación
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('userData');
      
      console.log('🔍 Verificando autenticación...');
      console.log('   Token existe:', !!token);
      console.log('   Token valor:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
      console.log('   UserData existe:', !!userDataStr);
      
      if (!token) {
        console.error('❌ ERROR: No hay token en localStorage');
        throw new Error('No autenticado. Por favor inicia sesión.');
      }
      
      if (!userDataStr) {
        console.error('❌ ERROR: No hay userData en localStorage');
        throw new Error('Datos de usuario no encontrados.');
      }
      
      // 2. Parsear userData
      let userData;
      try {
        userData = JSON.parse(userDataStr);
        console.log('✅ UserData parseado correctamente:', userData);
      } catch (parseError) {
        console.error('❌ ERROR parsing userData:', parseError);
        throw new Error('Error al leer datos del usuario.');
      }
      
      // 3. Obtener idUsuario
      const idUsuario = userData?.idUsuario || userData?.id;
      console.log('🔑 idUsuario obtenido:', idUsuario);
      
      if (!idUsuario) {
        console.error('❌ ERROR: No se encontró idUsuario en:', userData);
        throw new Error('ID de usuario no encontrado en los datos.');
      }
      
      // 4. Preparar headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'idUsuario': idUsuario.toString()
      };
      
      console.log('📤 Headers preparados:', {
        'Content-Type': headers['Content-Type'],
        'Authorization': headers['Authorization'] ? 'PRESENTE' : 'FALTANTE',
        'idUsuario': headers['idUsuario']
      });
      
      // 5. Preparar config
      const config = { headers };
      
      // 6. Intentar enviar la solicitud
      console.log('🌐 Enviando solicitud POST a /api/comentarios/crear');
      console.log('📦 Datos enviados:', comentarioData);
      
      try {
        // Primero intentar con /api/
        const response = await api_url.post("/api/comentarios/crear", comentarioData, config);
        console.log('✅ Comentario creado exitosamente:', response.data);
        return response.data;
      } catch (apiError) {
        console.log('🔄 Falló con /api/, intentando sin /api/...');
        console.error('Error con /api/:', apiError.response?.data || apiError.message);
        
        // Intentar sin /api/
        try {
          const response = await api_url.post("/comentarios/crear", comentarioData, config);
          console.log('✅ Comentario creado (sin /api/):', response.data);
          return response.data;
        } catch (noApiError) {
          console.error('❌ Error también sin /api/:', noApiError.response?.data || noApiError.message);
          throw noApiError;
        }
      }
      
    } catch (error) {
      console.error("💥 ERROR CRÍTICO en crearComentario:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  }

  // Obtener comentarios de un producto (mantener igual)
  async getComentariosByProducto(idProducto) {
    try {
      console.log('📝 Solicitando comentarios para producto:', idProducto);
      
      // Primero intentar sin /api/
      try {
        const response = await api_url.get(`/comentarios/producto/${idProducto}`);
        console.log('✅ Comentarios obtenidos:', response.data?.length || 0);
        return response.data || [];
      } catch (publicError) {
        console.log('🔄 Intentando con /api/...');
        const response = await api_url.get(`/api/comentarios/producto/${idProducto}`);
        return response.data || [];
      }
    } catch (error) {
      console.error("❌ Error al obtener comentarios:", error.message);
      return [];
    }
  }

  // Obtener comentario del usuario (mantener igual)
  async getComentarioUsuario(idProducto) {
    try {
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('userData');
      
      if (!token || !userDataStr) {
        return null;
      }
      
      let userData;
      try {
        userData = JSON.parse(userDataStr);
      } catch {
        return null;
      }
      
      const idUsuario = userData?.idUsuario || userData?.id;
      
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'idUsuario': idUsuario?.toString() || ''
        } 
      };
      
      try {
        const response = await api_url.get(`/api/comentarios/producto/${idProducto}/usuario`, config);
        return response.data;
      } catch (apiError) {
        const response = await api_url.get(`/comentarios/producto/${idProducto}/usuario`, config);
        return response.data;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Error al obtener comentario usuario:", error.message);
      return null;
    }
  }

  // Eliminar comentario (mantener igual)
  async eliminarComentario(idComentario) {
    try {
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('userData');
      
      if (!token || !userDataStr) {
        throw new Error('No autenticado');
      }
      
      let userData;
      try {
        userData = JSON.parse(userDataStr);
      } catch {
        throw new Error('Error al leer datos del usuario');
      }
      
      const idUsuario = userData?.idUsuario || userData?.id;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'idUsuario': idUsuario?.toString() || ''
        }
      };
      
      try {
        const response = await api_url.delete(`/api/comentarios/${idComentario}`, config);
        return response.data;
      } catch (apiError) {
        const response = await api_url.delete(`/comentarios/${idComentario}`, config);
        return response.data;
      }
    } catch (error) {
      console.error("Error al eliminar comentario:", error.message);
      throw error;
    }
  }

  // Obtener estadísticas (mantener igual)
  async getEstadisticasProducto(idProducto) {
    try {
      try {
        const response = await api_url.get(`/api/comentarios/producto/${idProducto}/estadisticas`);
        return response.data;
      } catch (publicError) {
        const response = await api_url.get(`/api/comentarios/producto/${idProducto}/estadisticas`);
        return response.data;
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error.message);
      return {
        promedioCalificacion: 0,
        totalComentarios: 0
      };
    }
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new ComentarioService();