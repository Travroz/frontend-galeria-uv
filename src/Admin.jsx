import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// URL oficial de tu backend desplegado en Render
const API_URL = "https://backend-galeria-uv.onrender.com";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("uvAdminToken"));
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [modelos, setModelos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(false);

  // Cargar lista de modelos al iniciar sesión
  const fetchModelos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/modelos`);
      const data = await res.json();
      setModelos(data);
    } catch (err) {
      console.error("Error cargando modelos", err);
    }
  };

  useEffect(() => {
    if (token) fetchModelos();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("uvAdminToken", data.token);
        setToken(data.token);
      } else {
        setLoginError("Contraseña incorrecta. Acceso denegado.");
      }
    } catch (err) {
      setLoginError("Error de conexión con el servidor.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("uvAdminToken");
    setToken(null);
  };

  // Preparar formulario para editar
  const iniciarEdicion = (modelo) => {
    setEditandoId(modelo.id);
    setTitulo(modelo.titulo);
    setCategoria(modelo.categoria || "");
    setDescripcion(modelo.descripcion);
    setArchivo(null); // No obligamos a resubir el archivo
    setMensaje({ texto: "", tipo: "" });
    window.scrollTo({ top: 0, behavior: "smooth" }); // Subir la vista al formulario
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTitulo("");
    setCategoria("");
    setDescripcion("");
    setArchivo(null);
    setMensaje({ texto: "", tipo: "" });
  };

  // Eliminar modelo
  const eliminarModelo = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar esta figura de forma permanente?",
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/api/modelos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchModelos(); // Refrescar lista
        if (editandoId === id) cancelarEdicion();
      }
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  // Subir nuevo o Actualizar existente
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si estamos creando uno nuevo, el archivo es obligatorio
    if (!editandoId && !archivo) return alert("Selecciona un archivo .glb");

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("categoria", categoria);
    formData.append("descripcion", descripcion);
    if (archivo) formData.append("archivo3d", archivo);

    const url = editandoId
      ? `${API_URL}/api/modelos/${editandoId}`
      : `${API_URL}/api/modelos`;

    const method = editandoId ? "PUT" : "POST";

    try {
      setCargando(true);
      setMensaje({
        texto: editandoId ? "Actualizando datos..." : "Subiendo archivo...",
        tipo: "info",
      });

      const response = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        setMensaje({
          texto: editandoId
            ? "¡Modelo actualizado exitosamente!"
            : "¡Modelo publicado exitosamente!",
          tipo: "exito",
        });
        fetchModelos(); // Refrescar la lista de abajo
        if (!editandoId) {
          setTitulo("");
          setCategoria("");
          setDescripcion("");
          setArchivo(null);
          e.target.reset();
        }
      } else if (response.status === 401 || response.status === 403) {
        alert("Tu sesión ha expirado.");
        handleLogout();
      } else {
        setMensaje({ texto: "Error de servidor.", tipo: "error" });
      }
    } catch (error) {
      setMensaje({ texto: "Error de conexión.", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  // PANTALLA DE LOGIN
  if (!token) {
    return (
      <div className="min-h-screen bg-uv-azul flex items-center justify-center p-6 relative overflow-hidden">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md z-10 text-center">
          <div className="w-16 h-16 bg-uv-celeste rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6">
            <span className="text-white font-black text-2xl">UV</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
            Acceso Restringido
          </h2>
          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <input
              type="password"
              placeholder="Contraseña de administrador"
              required
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-uv-celeste outline-none transition-all text-center tracking-widest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {loginError && (
              <p className="text-red-500 font-bold text-sm">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full font-bold py-4 rounded-xl shadow-lg bg-uv-azul text-white hover:bg-blue-800 transition-all"
            >
              Ingresar
            </button>
          </form>
          <div className="mt-6">
            <Link
              to="/"
              className="text-gray-400 hover:text-uv-celeste text-sm font-semibold"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA DE ADMINISTRACIÓN
  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-uv-azul rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl">UV</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800">
            Gestor de Repositorio 3D
          </h2>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white text-uv-azul font-bold px-4 py-2 rounded-lg shadow border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          Cerrar Sesión
        </button>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* COLUMNA IZQUIERDA: Formulario */}
        <div className="bg-white rounded-2xl shadow-xl border-t-8 border-uv-azul p-8 h-fit">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {editandoId ? "Editando Figura" : "Subir Nueva Figura"}
              </h3>
              {editandoId && (
                <p className="text-uv-celeste font-semibold text-sm">
                  Modificando ID: {editandoId}
                </p>
              )}
            </div>
            {editandoId && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="text-sm text-red-500 hover:underline font-bold"
              >
                Cancelar Edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-uv-azul mb-1 uppercase">
                Título
              </label>
              <input
                type="text"
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-uv-celeste outline-none transition-all shadow-sm"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-uv-azul mb-1 uppercase">
                Categoría
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Vasijas, Esculturas, Fósiles..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-uv-celeste outline-none transition-all shadow-sm"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-uv-azul mb-1 uppercase">
                Descripción
              </label>
              <textarea
                required
                rows="4"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-uv-celeste outline-none transition-all shadow-sm resize-none"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-uv-azul mb-1 uppercase">
                {editandoId
                  ? "Actualizar Archivo .glb (Opcional)"
                  : "Archivo .glb (Obligatorio)"}
              </label>
              <input
                type="file"
                accept=".glb"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:text-uv-azul hover:file:bg-gray-200 cursor-pointer"
                onChange={(e) => setArchivo(e.target.files[0])}
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={`w-full font-bold py-3 rounded-lg shadow-md transition-all mt-4 ${cargando ? "bg-gray-400 text-white cursor-not-allowed" : "bg-uv-azul text-white hover:bg-uv-celeste"}`}
            >
              {cargando
                ? "Procesando..."
                : editandoId
                  ? "Guardar Cambios"
                  : "Publicar Figura"}
            </button>
          </form>

          {mensaje.texto && (
            <div
              className={`mt-4 p-3 rounded text-center font-bold text-sm ${mensaje.tipo === "exito" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {mensaje.texto}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Lista de Figuras */}
        <div className="bg-white rounded-2xl shadow-xl p-8 h-[600px] flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
            Figuras Publicadas ({modelos.length})
          </h3>
          <div className="overflow-y-auto pr-2 space-y-4 flex-1">
            {modelos.length === 0 ? (
              <p className="text-gray-400 text-center mt-10">
                No hay modelos en el repositorio.
              </p>
            ) : (
              modelos.map((modelo) => (
                <div
                  key={modelo.id}
                  className={`p-4 border rounded-xl flex flex-col gap-2 transition-all ${editandoId === modelo.id ? "border-uv-celeste bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-uv-azul truncate pr-2">
                      {modelo.titulo}
                    </h4>
                    <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0">
                      {modelo.categoria || "Sin Categoría"}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1 items-center">
                    <button
                      onClick={() => iniciarEdicion(modelo)}
                      className="text-sm text-uv-celeste font-bold hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarModelo(modelo.id)}
                      className="text-sm text-red-500 font-bold hover:underline"
                    >
                      Eliminar
                    </button>
                    <a
                      // URL pública de Supabase Storage corregida
                      href={`https://ndhrggqmljybtepzmywhd.supabase.co/storage/v1/object/public/modelos/${modelo.archivo}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-gray-500 font-bold hover:underline ml-auto"
                    >
                      Ver .glb
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 text-center pt-4 border-t border-gray-100">
            <Link
              to="/"
              className="text-uv-celeste hover:underline font-semibold text-sm"
            >
              Ir a la vista pública del repositorio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
