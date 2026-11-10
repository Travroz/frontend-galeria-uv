import React, { useState, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Html } from "@react-three/drei";
import ModelViewer from "./ModelViewer";

// URL oficial de tu backend desplegado en Render
const API_URL = "https://backend-galeria-uv.onrender.com";

export default function Inicio() {
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modeloDestacado, setModeloDestacado] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");

  useEffect(() => {
    fetch(`${API_URL}/api/modelos`)
      .then((res) => res.json())
      .then((data) => {
        setModelos(data);
        const cats = [
          ...new Set(data.map((m) => m.categoria || "Sin Categoría")),
        ];
        setCategorias(cats);
        if (data.length > 0) setModeloDestacado(data[0]);
      })
      .catch((err) => console.error(err));
  }, []);

  const modelosMostrados =
    categoriaActiva === "Todas"
      ? modelos
      : modelos.filter(
          (m) => (m.categoria || "Sin Categoría") === categoriaActiva,
        );

  return (
    <div className="min-h-screen bg-slate-800/90 bg-[url('/fondo.jpg')] bg-cover bg-center bg-fixed bg-blend-multiply flex flex-col font-sans">
      {/* Encabezado */}
      <header className="bg-slate-950/70 backdrop-blur-md px-8 py-5 border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-sm flex items-center justify-center">
              <span className="text-slate-900 font-black text-xl tracking-tighter">
                UV
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-100 tracking-wide">
              Repositorio Digital
            </h1>
          </div>
          <Link
            to="/admin"
            className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
          >
            Acceso Docentes
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* SECCIÓN 1: Presentación y Placeholder 3D */}
        <section className="max-w-7xl mx-auto px-8 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-12 border-b border-slate-600/50">
          <div className="w-full lg:w-1/2 space-y-6">
            <h2 className="text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-md">
              Preservación <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">
                Tridimensional
              </span>
            </h2>
            <p className="text-lg text-slate-200 leading-relaxed max-w-xl drop-shadow">
              Bienvenido al archivo digital interactivo. Explora piezas, objetos
              y estructuras analizadas mediante técnicas de fotogrametría y
              escaneo 3D, preservando sus detalles y texturas en alta fidelidad.
            </p>
          </div>

          <div className="w-full lg:w-1/2 h-[400px] lg:h-[450px] bg-slate-900/40 backdrop-blur-sm rounded-2xl overflow-hidden relative shadow-2xl border border-slate-600/50">
            {modeloDestacado ? (
              <Canvas shadows camera={{ position: [0, 0, 4], fov: 45 }}>
                <Suspense
                  fallback={
                    <Html center>
                      <span className="text-slate-200 font-bold bg-slate-900/80 px-4 py-2 rounded-lg shadow-sm whitespace-nowrap">
                        Cargando 3D...
                      </span>
                    </Html>
                  }
                >
                  <Stage environment="city" intensity={0.5} adjustCamera={1.2}>
                    <ModelViewer
                      // URL corregida a Supabase Storage
                      url={`https://ndhrggmljybtepzmywhd.supabase.co/storage/v1/object/public/modelos/${modeloDestacado.archivo}`}
                    />
                  </Stage>
                </Suspense>
                <OrbitControls
                  autoRotate
                  autoRotateSpeed={1.5}
                  enableZoom={false}
                  enablePan={false}
                />
              </Canvas>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
                Aún no hay modelos en el servidor
              </div>
            )}
          </div>
        </section>

        {/* SECCIÓN 2: Selector de Categorías y Opciones Desplegadas */}
        <section className="max-w-7xl mx-auto px-8 py-16">
          {/* Barra de Filtro / Selector */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-200/50">
            <h3 className="text-2xl font-bold text-slate-800 mb-4 md:mb-0">
              {categoriaActiva === "Todas"
                ? "Todas las Figuras"
                : `Colección: ${categoriaActiva}`}
            </h3>

            {categorias.length > 0 && (
              <div className="relative w-full md:w-80">
                <select
                  value={categoriaActiva}
                  onChange={(e) => setCategoriaActiva(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-800 py-3 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-800 font-bold cursor-pointer"
                >
                  <option value="Todas">Mostrar Todas las Categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Cuadrícula de Esculturas Filtradas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modelosMostrados.map((modelo) => (
              <div
                key={modelo.id}
                className="bg-white/95 backdrop-blur-sm border border-slate-200/50 rounded-xl p-6 flex flex-col shadow-lg hover:shadow-2xl hover:border-slate-300 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xl font-bold text-slate-900 truncate pr-2">
                    {modelo.titulo}
                  </h4>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0">
                    {modelo.categoria || "Sin Categoría"}
                  </span>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                  {modelo.descripcion}
                </p>

                <Link
                  to={`/visor/${modelo.id}`}
                  className="w-full block text-center bg-slate-100 border border-slate-300 text-slate-800 font-bold py-3 rounded-lg hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-colors shadow-sm"
                >
                  Inspeccionar en 3D
                </Link>
              </div>
            ))}
          </div>

          {modelosMostrados.length === 0 && (
            <div className="text-center py-20 bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-700 mt-8 shadow-inner">
              <p className="text-slate-200 text-xl font-medium">
                No hay figuras en esta colección.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
