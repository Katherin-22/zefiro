import { Routes, Route } from "react-router-dom";
import { FiltroProvider } from "../utils/FiltroContextx";
import ProtectedRoute from "../components/ProtectedRoute";
import AccessDenied from "../pages/usuario/denied/accesDenied";

/* ==============================
   IMPORTACIÓN DE PÁGINAS PÚBLICAS
   (Acceso sin login)
============================== */
import Home from "../pages/home/home";                      // Página principal
import Catalogo from "../pages/home/category/catalogo";     // Catálogo de productos
import ProductoGen from "../pages/home/productoGen";        // Detalle de producto
import CategoriasMobilePage from "../pages/home/category/categorias";
import FavoritosPage  from "../pages/home/favoritos";
/* ==============================
   ADMINISTRACIÓN - GENERAL
   (Dashboard principal)
============================== */
import Inbox from "../pages/administrador/inbox";                           // Bandeja de entrada
import AdminDevoluciones from "../pages/administrador/gestion/gestiondevoluciones/AdminDevoluciones"; // Devoluciones
import GestionCambios from "../pages/administrador/gestion/gestionCambios"; // Cambios de productos
import GestionPagina from "../pages/administrador/gestion/gestionPagina";   // Configuración web
import GestionPedido from "../pages/administrador/gestion/gestionPedido";   // Pedidos
import AdminUserManagement from "../pages/administrador/gestion/gestionusuariosadmin/AdminUserManagement"; // Usuarios

/* ==============================
   ADMINISTRACIÓN - STOCK
   (Gestión de inventario)
============================== */
import Stock from "../pages/administrador/stock/Stock";                     // Vista general stock
import GetIDStock from "../pages/administrador/stock/GetIDStock";           // Stock por producto
import CreateStock from "../pages/administrador/stock/CreateStock";         // Crear stock
import UpdateStock from "../pages/administrador/stock/UpdateStock";         // Actualizar stock

/* ==============================
   ADMINISTRACIÓN - PRODUCTO
   (CRUD de productos)
============================== */
import GetProducto from "../pages/administrador/producto/GetProducto";      // Listar productos
import CreateProducto from "../pages/administrador/producto/CreateProducto"; // Crear producto
import UpdateProducto from "../pages/administrador/producto/UpdateProducto"; // Editar producto
import CreateImagen from "../pages/administrador/imagen/CreateImagen";       // Añadir imagen
import UpdateImagen from "../pages/administrador/imagen/UpdateImagen";       // Editar imagen

/* ==============================
   ADMINISTRACIÓN - CATEGORÍA
   (Gestión de categorías)
============================== */
import GetCategoria from "../pages/administrador/categoria/GetCategoria";   // Listar categorías
import CreateCategoria from "../pages/administrador/categoria/CreateCategoria"; // Crear categoría
import UpdateCategoria from "../pages/administrador/categoria/UpdateCategoria"; // Editar categoría

/* ==============================
   ADMINISTRACIÓN - PROMOCIÓN
   (Gestión de descuentos)
============================== */
import GetPromocion from "../pages/administrador/promocion/GetPromocion";   // Listar promociones
import CreatePromocion from "../pages/administrador/promocion/CreatePromocion"; // Crear promoción
import UpdatePromocion from "../pages/administrador/promocion/UpdatePromocion"; // Editar promoción

/* ==============================
   ADMINISTRACIÓN - COLOR
   (Gestión de colores)
============================== */
import GetColor from "../pages/administrador/color/GetColor";               // Listar colores
import CreateColor from "../pages/administrador/color/CreateColor";         // Crear color
import UpdateColor from "../pages/administrador/color/UpdateColor";         // Editar color

/* ==============================
   ADMINISTRACIÓN - MARCA
   (Gestión de marcas)
============================== */
import GetMarca from "../pages/administrador/marca/GetMarca";               // Listar marcas
import CreateMarca from "../pages/administrador/marca/CreateMarca";         // Crear marca
import UpdateMarca from "../pages/administrador/marca/UpdateMarca";         // Editar marca

/* ==============================
   ADMINISTRACIÓN - MATERIAL
   (Gestión de materiales)
============================== */
import GetMaterial from "../pages/administrador/material/GetMaterial";      // Listar materiales
import CreateMaterial from "../pages/administrador/material/CreateMaterial"; // Crear material
import UpdateMaterial from "../pages/administrador/material/UpdateMaterial"; // Editar material

/* ==============================
   COMPONENTES DE AUTENTICACIÓN
   (Login, registro, recuperación)
============================== */
import LoginPage from '../pages/usuario/LoginPage'                          // Página de login
import RegistrarUsuarios from '../pages/usuario/RegistrarUsuarios'          // Registro
import RecuperarContraseña from '../pages/usuario/RecuperarContraseña'      // Recuperar contraseña
import Login from '../components/iniciosesion/Login'                        // Componente login

/* ==============================
   PERFIL USUARIO
   (Área personal)
============================== */
import PerfilUsuario from '../pages/usuario/PerfilUsuario'   

/* ==============================
   METODOS DE PAGO
============================== */
import FormDireccion from '../pages/direccion/FormDireccion'   // metodos de pago

/* ==============================
   METODOS DE PAGO
============================== */
import PaymentPage from '../pages/metodoPagos/PaymentPage'   // metodos de pago


/* ==============================
   carrito
============================== */
import Carrito from "../pages/carrito/Carrito";

/* ==============================
   METODOS DE PAGO
============================== */
import FormDireccion from '../pages/direccion/FormDireccion'   // metodos de pago

/* ==============================
   METODOS DE PAGO
============================== */
import PaymentPage from '../pages/metodoPagos/PaymentPage'


function AppRoutes() {
   return (
      <FiltroProvider>
         <Routes>
            
            {/* ========== RUTAS PÚBLICAS ========== */}
            {/* 🏠 Página principal - Acceso libre */}
            <Route path="/" element={<Home />} />
            
            {/* 📚 Catálogo de productos - Acceso libre */}
            <Route path="/Catalogo" element={<Catalogo />} />
            
            {/* 👟 Detalle de producto - Acceso libre */}
            <Route path="/home/:codigoReferencia" element={<ProductoGen />} />
            
            {/* ========== RUTAS DE ADMINISTRACIÓN ========== */}
            {/* ✉️ Bandeja de entrada admin */}
            <Route path="/Administrador/Inbox" element={
               <ProtectedRoute requireAdmin={true}>
                  <Inbox />
               </ProtectedRoute>
            } />

            <Route path="/favoritos" element={
               <ProtectedRoute >
                  <FavoritosPage />
               </ProtectedRoute>
            }/>
            
            {/* 🔄 Gestión de devoluciones */}
            <Route path="/Administrador/Gestion_Devoluciones" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminDevoluciones />
               </ProtectedRoute>
            } />
            
            {/* ⚙️ Configuración de página web */}
            <Route path="/Administrador/Gestion_Pagina" element={
               <ProtectedRoute requireAdmin={true}>
                  <GestionPagina />
               </ProtectedRoute>
            } />
            
            {/* 📦 Gestión de pedidos */}
            <Route path="/Administrador/Gestion_Pedido" element={
               <ProtectedRoute requireAdmin={true}>
                  <GestionPedido />
               </ProtectedRoute>
            } />
            
            {/* 👥 Gestión de usuarios (CRUD) */}
            <Route path="/Administrador/Usuarios" element={
               <ProtectedRoute requireAdmin={true}>
                  <AdminUserManagement />
               </ProtectedRoute>
            } />
            
            {/* 🔀 Gestión de cambios */}
            <Route path="/Administrador/Gestion_Cambios" element={
               <ProtectedRoute requireAdmin={true}>
                  <GestionCambios />
               </ProtectedRoute>
            } />
            
            {/* ========== CRUD PRODUCTOS ========== */}
            {/* 📋 Listar todos los productos */}
            <Route path="/ver_producto" element={
               <ProtectedRoute requireAdmin={true}>
                  <GetProducto /> {/* CORREGIDO: antes tenía GetIDStock */}
               </ProtectedRoute>
            } />
            
            {/* ➕ Crear nuevo producto */}
            <Route path="/crear_producto" element={
               <ProtectedRoute requireAdmin={true}>
                  <CreateProducto /> {/* CORREGIDO: antes tenía CreateStock */}
               </ProtectedRoute>
            } />
            
            {/* ✏️ Editar producto existente */}
            <Route path="/producto/:idProducto" element={
               <ProtectedRoute requireAdmin={true}>
                  <UpdateProducto /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* 🖼️ Añadir imágenes a producto */}
            <Route path="/producto/:idProducto/imagenes" element={
               <ProtectedRoute requireAdmin={true}>
                  <CreateImagen /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* 🖋️ Editar imagen específica */}
            <Route path="/producto/:idProducto/imagen/:idImagen" element={
               <ProtectedRoute requireAdmin={true}>
                  <UpdateImagen /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ========== CRUD CATEGORÍAS ========== */}
            {/* 📋 Listar categorías */}
            <Route path="/ver_categoria" element={
               <ProtectedRoute requireAdmin={true}>
                  <GetCategoria /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ➕ Crear nueva categoría */}
            <Route path="/categoria" element={
               <ProtectedRoute requireAdmin={true}>
                  <CreateCategoria /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ✏️ Editar categoría existente */}
            <Route path="/categoria/:idCategoria" element={
               <ProtectedRoute requireAdmin={true}>
                  <UpdateCategoria /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ========== CRUD STOCK ========== */}
            {/* ➕ Crear stock para producto */}
            <Route path="/stock/:idProducto" element={
               <ProtectedRoute requireAdmin={true}>
                  <CreateStock /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* 👀 Ver stock de producto */}
            <Route path="/stock/producto/:idProducto" element={
               <ProtectedRoute requireAdmin={true}>
                  <GetIDStock /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ✏️ Actualizar stock específico */}
            <Route path="/producto/:idProducto/stock/:idStock" element={
               <ProtectedRoute requireAdmin={true}>
                  <UpdateStock /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ========== CRUD PROMOCIONES ========== */}
            {/* 🏷️ Listar promociones */}
            <Route path="/ver_promocion" element={
               <ProtectedRoute requireAdmin={true}>
                  <GetPromocion /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ➕ Crear nueva promoción */}
            <Route path="/crear_promocion" element={
               <ProtectedRoute requireAdmin={true}>
                  <CreatePromocion /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ✏️ Editar promoción existente */}
            <Route path="/promocion/:idPromocion" element={
               <ProtectedRoute requireAdmin={true}>
                  <UpdatePromocion /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ========== CRUD COLORES ========== */}
            {/* 🎨 Listar colores */}
            <Route path="/ver_color" element={
               <ProtectedRoute requireAdmin={true}>
                  <GetColor /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ➕ Crear nuevo color */}
            <Route path="/crear_color" element={
               <ProtectedRoute requireAdmin={true}>
                  <CreateColor /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ✏️ Editar color existente */}
            <Route path="/color/:idColor" element={
               <ProtectedRoute requireAdmin={true}>
                  <UpdateColor /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ========== CRUD MARCAS ========== */}
            {/* 🏭 Listar marcas */}
            <Route path="/ver_marca" element={
               <ProtectedRoute requireAdmin={true}>
                  <GetMarca /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ➕ Crear nueva marca */}
            <Route path="/crear_marca" element={
               <ProtectedRoute requireAdmin={true}>
                  <CreateMarca /> {/* CORREGIDO: tenía typo "eelement" */}
               </ProtectedRoute>
            } />
            
            {/* ✏️ Editar marca existente */}
            <Route path="/marca/:idMarca" element={
               <ProtectedRoute requireAdmin={true}>
                  <UpdateMarca /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ========== CRUD MATERIALES ========== */}
            {/* 🧵 Listar materiales */}
            <Route path="/ver_material" element={
               <ProtectedRoute requireAdmin={true}>
                  <GetMaterial /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ➕ Crear nuevo material */}
            <Route path="/crear_material" element={
               <ProtectedRoute requireAdmin={true}>
                  <CreateMaterial /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ✏️ Editar material existente */}
            <Route path="/material/:idMaterial" element={
               <ProtectedRoute requireAdmin={true}>
                  <UpdateMaterial /> {/* CORREGIDO: antes tenía AdminUserManagement */}
               </ProtectedRoute>
            } />
            
            {/* ========== PANEL STOCK GENERAL ========== */}
            {/* 📊 Vista general de stock */}
            <Route path="/Administrador/stock" element={
               <ProtectedRoute requireAdmin={true}>
                  <Stock />
               </ProtectedRoute>
            } />
            
            {/* ========== AUTENTICACIÓN ========== */}
            {/* 🔐 Página de login principal */}
            <Route path='/loginpage' element={<LoginPage/>}/>
            
            {/* 📝 Formulario de registro */}
            <Route path='/registrarUsuarios' element={<RegistrarUsuarios/>}/>
            <Route path="/categorias-mobile" element={<CategoriasMobilePage />} />
            
            {/* 🔓 Recuperación de contraseña */}
            <Route path='/recuperarContraseña' element={<RecuperarContraseña/>}/>
            
            {/* 👤 Componente de login */}
            <Route path='/login' element={<Login/>}/>
            
            {/* ========== PERFIL USUARIO ========== */}
            {/* 👤 Perfil protegido (requiere login) */}
            <Route path='/perfilUsuario' element={
               <ProtectedRoute>
                  <PerfilUsuario />
               </ProtectedRoute>
            }/>

            {/* ========== CARRITO USUARIO ========== */}
            
            <Route path="/carrito" element={<Carrito />} />

            {/* Componente de metodos de pago */}
            <Route path="/api/payments/create/:idUsuario" element={<PaymentPage/>}/>  

            <Route path="/form-direccion" element={<FormDireccion/>}/>             

            {/* ========== PÁGINAS DE ERROR ========== */}
            {/* 🚫 Acceso denegado */}
            <Route path="/acceso-denegado" element={<AccessDenied />} />
            
            {/* ❌ Página no encontrada (404) */}
            <Route path="*" element={<div>Página no encontrada</div>} />
            
            {/* Componente de metodos de pago */}
            <Route path="/api/payments/create/:idUsuario" element={<PaymentPage/>}/>  

            <Route path="/form-direccion" element={<FormDireccion/>}/>             
            
         </Routes>
      </FiltroProvider>
   );
}

export default AppRoutes;