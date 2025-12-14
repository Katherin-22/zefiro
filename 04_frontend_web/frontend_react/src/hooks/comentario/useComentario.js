// hooks/comentario/useComentario.js
import { useState, useCallback } from 'react';
import comentarioService from '../../services/comentario/comentarioService';

const useComentario = () => {
  const [comentarios, setComentarios] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    promedioCalificacion: 0,
    totalComentarios: 0
  });
  const [comentarioUsuario, setComentarioUsuario] = useState(null);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [error, setError] = useState(null);

  // Cargar comentarios
  const cargarComentariosProducto = useCallback(async (idProducto, isAuthenticated) => {
    if (!idProducto) return;

    try {
      setLoadingComentarios(true);
      setError(null);
      
      console.log('🔄 Cargando comentarios para producto:', idProducto);

      // Cargar comentarios
      const comentariosData = await comentarioService.getComentariosByProducto(idProducto);
      setComentarios(comentariosData || []);

      // Cargar estadísticas
      try {
        const statsData = await comentarioService.getEstadisticasProducto(idProducto);
        setEstadisticas(statsData);
      } catch (statsError) {
        console.warn('⚠️ Error cargando estadísticas:', statsError);
        setEstadisticas({
          promedioCalificacion: comentariosData?.length > 0 
            ? comentariosData.reduce((acc, c) => acc + c.calificacion, 0) / comentariosData.length
            : 0,
          totalComentarios: comentariosData?.length || 0
        });
      }

      // Si está autenticado, cargar su comentario
      if (isAuthenticated) {
        try {
          const userComment = await comentarioService.getComentarioUsuario(idProducto);
          setComentarioUsuario(userComment);
          console.log('👤 Comentario del usuario:', userComment ? 'SÍ' : 'NO');
        } catch (userCommentError) {
          console.warn('⚠️ Error cargando comentario usuario:', userCommentError);
          setComentarioUsuario(null);
        }
      } else {
        setComentarioUsuario(null);
      }

      console.log('✅ Comentarios cargados exitosamente');

    } catch (err) {
      console.error("❌ Error al cargar comentarios:", err);
      setError(err.message || 'Error al cargar comentarios');
      setComentarios([]);
      setEstadisticas({ promedioCalificacion: 0, totalComentarios: 0 });
    } finally {
      setLoadingComentarios(false);
    }
  }, []);

  // Crear comentario - MEJORADO
  const crearComentario = useCallback(async (idProducto, comentarioData) => {
    console.log('🎯 Iniciando crearComentario en hook');
    console.log('   idProducto:', idProducto);
    console.log('   comentarioData:', comentarioData);
    
    try {
      setEnviandoComentario(true);
      setError(null);

      // Validar datos mínimos
      if (!idProducto) {
        throw new Error('ID de producto no válido');
      }
      
      if (!comentarioData || !comentarioData.comentario || !comentarioData.calificacion) {
        throw new Error('Datos del comentario incompletos');
      }
      
      // Asegurar que el idProducto esté en los datos
      const datosCompletos = {
        ...comentarioData,
        idProducto: idProducto
      };
      
      console.log('📤 Enviando datos completos al servicio:', datosCompletos);
      
      const nuevoComentario = await comentarioService.crearComentario(datosCompletos);
      
      console.log('✅ Comentario creado en servicio, actualizando estado...');
      
      // Actualizar estado local
      setComentarios(prev => [nuevoComentario, ...prev]);
      setComentarioUsuario(nuevoComentario);

      // Actualizar estadísticas
      try {
        const statsData = await comentarioService.getEstadisticasProducto(idProducto);
        setEstadisticas(statsData);
      } catch (statsError) {
        console.warn('⚠️ Error actualizando estadísticas:', statsError);
        // Recalcular localmente
        const nuevosComentarios = [nuevoComentario, ...comentarios];
        setEstadisticas({
          promedioCalificacion: nuevosComentarios.reduce((acc, c) => acc + c.calificacion, 0) / nuevosComentarios.length,
          totalComentarios: nuevosComentarios.length
        });
      }

      console.log('🎉 Comentario creado exitosamente en hook');
      return nuevoComentario;
      
    } catch (err) {
      console.error("💥 Error en crearComentario (hook):", err);
      setError(err.message || 'Error al crear comentario');
      throw err;
    } finally {
      setEnviandoComentario(false);
    }
  }, [comentarios]);

  // Eliminar comentario
  const eliminarComentario = useCallback(async (idComentario, idProducto) => {
    try {
      await comentarioService.eliminarComentario(idComentario);

      // Actualizar estado local
      setComentarios(prev => prev.filter(c => c.idComentario !== idComentario));
      setComentarioUsuario(null);

      // Actualizar estadísticas
      try {
        const statsData = await comentarioService.getEstadisticasProducto(idProducto);
        setEstadisticas(statsData);
      } catch (statsError) {
        console.warn('⚠️ Error actualizando estadísticas después de eliminar:', statsError);
        const nuevosComentarios = comentarios.filter(c => c.idComentario !== idComentario);
        setEstadisticas({
          promedioCalificacion: nuevosComentarios.length > 0
            ? nuevosComentarios.reduce((acc, c) => acc + c.calificacion, 0) / nuevosComentarios.length
            : 0,
          totalComentarios: nuevosComentarios.length
        });
      }

      return true;
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
      setError(err.message || 'Error al eliminar comentario');
      throw err;
    }
  }, [comentarios]);

  // Limpiar estado
  const limpiarComentarios = useCallback(() => {
    setComentarios([]);
    setEstadisticas({ promedioCalificacion: 0, totalComentarios: 0 });
    setComentarioUsuario(null);
    setError(null);
  }, []);

  return {
    // Estados
    comentarios,
    estadisticas,
    comentarioUsuario,
    loadingComentarios,
    enviandoComentario,
    error,
    
    // Funciones
    cargarComentariosProducto,
    crearComentario,
    eliminarComentario,
    limpiarComentarios,
    
    // Utilidades
    tieneComentarios: comentarios.length > 0,
    totalComentarios: comentarios.length
  };
};

export default useComentario;