import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Html, useProgress } from "@react-three/drei";
import ModelViewer from "./ModelViewer";
import { Link, useParams, useNavigate } from "react-router-dom";

// URL oficial de tu backend desplegado en Render
const API_URL = "https://backend-galeria-uv.onrender.com";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-slate-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <div className="text-slate-600 font-bold text-xl drop-shadow-md">
          {progress.toFixed(0)}%
        </div>
      </div>
    </Html>
  );
}

export default function Galeria() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [modeloActivo, setModeloActivo] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/modelos`)
      .then((res) => res.json())
      .then((data) => {
        setModelos(data);
        if (data.length > 0) {
          if (id) {
            const mod = data.find((m) => m.id === parseInt(id));
            setModeloActivo(mod || data[0]);
          } else {
            setModeloActivo(data[0]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleSelect = (e) => {
    navigate(`/visor/${e.target.value}`);
  };

  return (
    // CONTENEDOR PRINCIPAL: Tiene la imagen de fondo con filtro oscuro
    <div className="flex flex-col w-full h-screen font-sans bg-slate-800/90 bg-[url('/fondo.jpg')] bg-cover bg-center bg-fixed bg-blend-multiply overflow-hidden">
      {/* Encabezado esmerilado */}
      <header className="bg-slate-950/70 backdrop-blur-md px-6 py-4 border-b border-slate-700/50 flex justify-between items-center z-20 shadow-lg shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="w-10 h-10 bg-slate-100 hover:bg-white transition-colors rounded-sm flex items-center justify-center shadow-md cursor-pointer"
          >
            <svg
              className="w-6 h-6 text-slate-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </Link>
          <h1 className="text-xl font-semibold text-slate-100 tracking-wide drop-shadow-sm hidden md:block">
            Visor Interactivo
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {modelos.length > 0 && (
            <div className="relative">
              <select
                className="appearance-none bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-md pl-5 pr-10 py-2 outline-none shadow-sm cursor-pointer"
                value={modeloActivo?.id || ""}
                onChange={handleSelect}
              >
                {modelos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.titulo}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg
                  className="fill-current h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col md:flex-row h-full overflow-hidden relative">
        {/* PANEL IZQUIERDO (Texto): Translúcido, deja ver la imagen de fondo de la página */}
        <div className="w-full h-[40%] md:w-[35%] md:h-full bg-slate-900/80 backdrop-blur-md z-10 shadow-2xl p-10 flex flex-col border-r border-slate-700/50 overflow-y-auto">
          {modeloActivo ? (
            <div className="animate-fade-in-up mt-auto mb-auto">
              {modeloActivo.categoria && (
                <span className="bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1 rounded shadow-sm uppercase tracking-wider mb-4 inline-block">
                  {modeloActivo.categoria}
                </span>
              )}
              <h2 className="text-4xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 pb-2 drop-shadow-sm">
                {modeloActivo.titulo}
              </h2>
              <div className="w-16 h-1.5 bg-slate-500 rounded-full mb-8"></div>
              <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap font-light drop-shadow-sm">
                {modeloActivo.descripcion}
              </p>
            </div>
          ) : (
            <p className="text-slate-400 m-auto font-medium">Cargando...</p>
          )}
        </div>

        {/* PANEL DERECHO (Visor 3D): Fondo sólido gris claro con gradiente (tapa la imagen de fondo) */}
        <div className="w-full h-[60%] md:w-[65%] md:h-full relative cursor-grab active:cursor-grabbing bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-200 to-slate-300">
          {modeloActivo && (
            <Canvas
              shadows
              camera={{ position: [0, 0, 5], fov: 45 }}
              className="w-full h-full absolute inset-0"
            >
              <Suspense fallback={<Loader />}>
                <Stage environment="city" intensity={0.5} adjustCamera={1.2}>
                  <ModelViewer
                    key={modeloActivo.id}
                    // URL corregida a Supabase Storage
                    url={`https://ndhrgqmljybtepzmywhd.supabase.co/storage/v1/object/public/modelos/${modeloActivo.archivo}`}
                  />
                </Stage>
              </Suspense>
              <OrbitControls
                makeDefault
                autoRotate
                autoRotateSpeed={0.8}
                enableDamping
                dampingFactor={0.05}
              />
            </Canvas>
          )}

          {/* Marca de agua - Oscurecida para verse bien sobre el fondo gris claro */}
          <div className="absolute bottom-6 right-8 text-slate-400 font-bold tracking-widest opacity-50 select-none pointer-events-none z-10">
            UNIVERSIDAD DE VALPARAÍSO
          </div>
        </div>
      </main>
    </div>
  );
}
