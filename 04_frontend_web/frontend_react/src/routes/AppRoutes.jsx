import { Routes, Route } from "react-router-dom";
import { FiltroProvider } from "../utils/FiltroContextx";
import ProtectedRoute from "../components/ProtectedRoute";
import AccessDenied from "../pages/usuario/denied/accesDenied";
/* -----------------------------
   Páginas públicas
----------------------------- */
import Home from "../pages/home/home";
import Catalogo from "../pages/home/category/catalogo";
import ProductoGen from "../pages/home/productoGen";

/* -----------------------------
   Administración - General
----------------------------- */
import Inbox from "../pages/administrador/inbox";
import AdminDevoluciones from "../pages/administrador/gestion/gestiondevoluciones/AdminDevoluciones";
import GestionCambios from "../pages/administrador/gestion/gestionCambios";
import GestionPagina from "../pages/administrador/gestion/gestionPagina";
import GestionPedido from "../pages/administrador/gestion/gestionPedido";
import AdminUserManagement from "../pages/administrador/gestion/gestionusuariosadmin/AdminUserManagement";
/* -----------------------------
   Administración - Stock
----------------------------- */
import Stock from "../pages/administrador/stock/Stock";
import GetIDStock from "../pages/administrador/stock/GetIDStock";
import CreateStock from "../pages/administrador/stock/CreateStock";
import UpdateStock from "../pages/administrador/stock/UpdateStock";

/* -----------------------------
   Administración - Producto
----------------------------- */
import GetProducto from "../pages/administrador/producto/GetProducto";
import CreateProducto from "../pages/administrador/producto/CreateProducto";
import UpdateProducto from "../pages/administrador/producto/UpdateProducto";
import CreateImagen from "../pages/administrador/imagen/CreateImagen";
import UpdateImagen from "../pages/administrador/imagen/UpdateImagen";

/* -----------------------------
   Administración - Categoría
----------------------------- */
import GetCategoria from "../pages/administrador/categoria/GetCategoria";
import CreateCategoria from "../pages/administrador/categoria/CreateCategoria";
import UpdateCategoria from "../pages/administrador/categoria/UpdateCategoria";

/* -----------------------------
   Administración - Promoción
----------------------------- */
import GetPromocion from "../pages/administrador/promocion/GetPromocion";
import CreatePromocion from "../pages/administrador/promocion/CreatePromocion";
import UpdatePromocion from "../pages/administrador/promocion/UpdatePromocion";

/* -----------------------------
   Administración - Color
----------------------------- */
import GetColor from "../pages/administrador/color/GetColor";
import CreateColor from "../pages/administrador/color/CreateColor";
import UpdateColor from "../pages/administrador/color/UpdateColor";

/* -----------------------------
   Administración - Marca
----------------------------- */
import GetMarca from "../pages/administrador/marca/GetMarca";
import CreateMarca from "../pages/administrador/marca/CreateMarca";
import UpdateMarca from "../pages/administrador/marca/UpdateMarca";

/* -----------------------------
   Administración - Material
----------------------------- */
import GetMaterial from "../pages/administrador/material/GetMaterial";
import CreateMaterial from "../pages/administrador/material/CreateMaterial";
import UpdateMaterial from "../pages/administrador/material/UpdateMaterial";

/* -----------------------------
   Componentes de autenticación
----------------------------- */
import LoginPage from '../pages/usuario/LoginPage'
import RegistrarUsuarios from '../pages/usuario/RegistrarUsuarios'
import RecuperarContraseña from '../pages/usuario/RecuperarContraseña'
import Login from '../components/iniciosesion/Login'



/* -----------------------------
   perfil - usuario
----------------------------- */
import PerfilUsuario from '../pages/usuario/PerfilUsuario'


function AppRoutes() {
   return (

      <FiltroProvider>
         <Routes>
            {/* Páginas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/Catalogo" element={<Catalogo />} />
            <Route path="/home/:codigoReferencia" element={
                  <ProductoGen />
            } />
            {/* Administración general */}
            <Route path="/Administrador/Inbox" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            }  />
            <Route path="/Administrador/Gestion_Devoluciones" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/Administrador/Gestion_Pagina" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/Administrador/Gestion_Pedido" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/Administrador/Usuarios" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/Administrador/Gestion_Cambios" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/Administrador/stock" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />

            {/* Producto */}
            <Route path="/ver_producto" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/crear_producto" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/producto/:idProducto" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/producto/:idProducto/imagenes" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/producto/:idProducto/imagen/:idImagen" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />

            {/* Categoría */}
            <Route path="/ver_categoria" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/categoria" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/categoria/:idCategoria" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />

            {/* Stock */}
            <Route path="/stock/:idProducto"element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/stock/producto/:idProducto" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/producto/:idProducto/stock/:idStock" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />

            {/* Promoción */}
            <Route path="/ver_promocion" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/crear_promocion" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/promocion/:idPromocion" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />

            {/* Color */}
            <Route path="/ver_color" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/crear_color" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/color/:idColor" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />

            {/* Marca */}
            <Route path="/ver_marca" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/crear_marca" eelement={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/marca/:idMarca" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />

            {/* Material */}
            <Route path="/ver_material" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/crear_material" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            <Route path="/material/:idMaterial" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />

            {/* Autenticación */}
            {/* Ruta para el collage y el login */}
            <Route  path='/loginpage' element={<LoginPage/>}/>
            <Route  path='/registrarUsuarios' element={<RegistrarUsuarios/>}/>
            <Route  path='/recuperarContraseña' element={<RecuperarContraseña/>}/>
            <Route  path='/login' element={<Login/>}/>

            {/* Ruta para el perfil*/}
            <Route  path='/perfilUsuario' element={<PerfilUsuario/>}/>

            <Route path="/acceso-denegado" element={<AccessDenied />} />
            
            <Route path="*" element={<div>Página no encontrada</div>} />
            


         </Routes>
      </FiltroProvider>

   );
}

export default AppRoutes;