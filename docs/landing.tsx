import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Check } from 'lucide-react';

// --- UTILIDADES ---
// Función simple para combinar clases (simulando clsx para mayor limpieza)
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- COMPONENTES ATÓMICOS ---

const NavLink = ({ text, isActive = false, href = "#" }: { text: string, isActive?: boolean, href?: string }) => (
  <a 
    href={href} 
    className={cn(
      "relative px-1 py-2 text-[#0B1B32] transition-colors duration-300 text-[15px] tracking-wide",
      isActive ? "font-bold" : "font-medium hover:text-[#00F0D0] group"
    )}
  >
    {text}
    <span className={cn(
      "absolute bottom-0 left-0 w-full h-[2px] bg-[#00F0D0] transform transition-transform duration-300 origin-left",
      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
    )}></span>
  </a>
);

// Componente de Dropdown desacoplado
interface FilterOption {
  label: string;
  subLabel?: string;
}

interface SearchFilterItemProps {
  label: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  options: FilterOption[];
  hasSeparator?: boolean;
}

const SearchFilterItem = ({ label, value, isOpen, onToggle, options, hasSeparator }: SearchFilterItemProps) => {
  return (
    <div className={cn(
      "relative flex flex-col justify-center px-6 py-5 cursor-pointer w-full transition-all duration-300 group",
      "hover:bg-gray-50/80",
      // Separador vertical sutil solo en desktop y si se indica
      hasSeparator && "lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:h-12 lg:after:w-[1px] lg:after:bg-gray-200",
      // Borde inferior sutil en móvil para separar items visualmente
      "border-b border-gray-100 lg:border-none"
    )}
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    >
      <span className="text-[10px] md:text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-1.5 select-none flex items-center gap-1 transition-colors group-hover:text-[#00F0D0]">
        {label}
      </span>
      
      <div className="flex items-center justify-between text-[#0B1B32]">
        <span className="font-bold text-[16px] md:text-[17px] truncate select-none leading-tight">{value}</span>
        <div className={cn(
          "transition-transform duration-300 text-gray-400 group-hover:text-[#00F0D0]",
          isOpen && "rotate-180 text-[#00F0D0]"
        )}>
          <ChevronDown size={20} strokeWidth={2.5} />
        </div>
      </div>

      {/* Menú Flotante */}
      <div className={cn(
        "absolute top-[calc(100%+8px)] left-0 w-full min-w-[240px] bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 p-2 z-50",
        "transform transition-all duration-200 origin-top",
        isOpen ? "opacity-100 scale-100 translate-y-0 visible" : "opacity-0 scale-95 -translate-y-2 invisible pointer-events-none"
      )}>
        <div className="flex flex-col gap-1">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3 hover:bg-[#F0FDFA] rounded-xl transition-colors cursor-pointer group/item">
              <div>
                <div className="font-bold text-[#0B1B32] text-sm group-hover/item:text-[#00F0D0] transition-colors">{opt.label}</div>
                {opt.subLabel && <div className="text-xs text-gray-400 mt-0.5">{opt.subLabel}</div>}
              </div>
              {value.includes(opt.label) && <Check size={16} className="text-[#00F0D0]" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  
  // Referencia para detectar clicks fuera del filtro
  const filterContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-[#0B1B32] flex flex-col relative selection:bg-[#00F0D0] selection:text-[#0B1B32]">
      
      {/* --- NAVBAR --- */}
      <nav className="w-full max-w-[1500px] mx-auto px-6 py-6 flex items-center justify-between relative z-50">
        <div className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity select-none">
          <span className="text-[2.5rem] font-semibold tracking-tighter leading-none flex items-center gap-0.5">
            <span className="relative inline-block mr-[1px]">
              a
              <span className="absolute top-[8px] left-[4px] w-[5px] h-[5px] bg-white rounded-full"></span>
            </span>
            loba
          </span>
        </div>

        {/* Desktop Links - Posicionamiento absoluto central para equilibrio perfecto */}
        <div className="hidden lg:flex items-center space-x-12 absolute left-1/2 transform -translate-x-1/2">
          <NavLink text="Proyectos nuevos" />
          <NavLink text="Conócenos" isActive={true} />
          <NavLink text="Herramientas" />
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-6 font-bold text-sm tracking-wide">
          <button className="hover:text-[#00F0D0] transition-colors py-2">ES</button>
          <button className="hover:text-[#00F0D0] transition-colors py-2">$</button>
          <button className="bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-extrabold py-3.5 px-7 rounded-full text-sm transition-all shadow-[0_4px_15px_rgba(0,240,208,0.25)] hover:shadow-[0_6px_20px_rgba(0,240,208,0.4)] hover:-translate-y-0.5 active:translate-y-0">
            Crea tu usuario gratis
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#0B1B32] p-2 hover:bg-gray-100 rounded-full transition-colors">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      {/* Claves del layout robusto:
         1. `flex-grow`: Ocupa el espacio restante.
         2. `min-h-[85vh]`: Asegura altura imponente en pantallas grandes.
         3. `h-auto`: Permite crecer si el contenido (el botón verde) lo empuja en móviles.
         4. `py-20` (o más): Padding vertical generoso para evitar cortes.
      */}
      <div className="flex-grow mx-3 mb-3 md:mx-6 md:mb-6 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden flex flex-col items-center justify-center min-h-[85vh] shadow-2xl z-0">
        
        {/* Background Layer (Cinemático) */}
        <div className="absolute inset-0 z-0 bg-[#0B1B32]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#04080F] via-[#0E2A45] to-[#142C47] opacity-95"></div>
          {/* Grano sutil para evitar banding en el gradiente */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>
          {/* Luz volumétrica superior derecha */}
          <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-gradient-to-bl from-[#00F0D0]/10 via-transparent to-transparent blur-3xl rounded-full pointer-events-none"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl px-4 md:px-8 flex flex-col items-center text-center py-10 md:py-0">
          
          {/* Título - Leading ajustado para móviles y desktop */}
          <h1 className="text-[40px] leading-[1.15] sm:text-[56px] md:text-[72px] lg:text-[84px] md:leading-[1.05] font-bold text-white mb-8 md:mb-10 drop-shadow-2xl tracking-tight max-w-5xl mx-auto">
            El marketplace inmobiliario de<br className="block" />
            Ciudad de Guatemala
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-[28px] text-white/90 font-medium mb-12 md:mb-16 drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
            Encuentra una propiedad <span className="text-[#00F0D0] font-bold relative whitespace-nowrap">
              80% más rápido.
              <svg className="absolute -bottom-1 left-0 w-full h-3 text-[#00F0D0]/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 12 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </p>

          {/* --- BARRA DE BÚSQUEDA SOFISTICADA --- */}
          <div 
            ref={filterContainerRef}
            className="bg-white rounded-[2.5rem] p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-[400px] lg:max-w-[1100px] flex flex-col lg:flex-row items-stretch lg:items-center animate-in fade-in zoom-in-95 duration-700 backdrop-blur-sm border border-white/80"
          >
            
            {/* Filtros Flexibles */}
            <div className="flex-1 w-full">
               <SearchFilterItem 
                label="Ubicación" 
                value="Zona 14" 
                isOpen={openFilter === 'location'}
                onToggle={() => setOpenFilter(openFilter === 'location' ? null : 'location')}
                hasSeparator={true}
                options={[
                  { label: 'Zona 14', subLabel: 'La Villa, Las Américas' },
                  { label: 'Zona 10', subLabel: 'Zona Viva, Oakland' },
                  { label: 'Cayalá', subLabel: 'Paseo Cayalá, Lirios' },
                  { label: 'Zona 15', subLabel: 'Vista Hermosa' }
                ]}
              />
            </div>

            <div className="flex-1 w-full">
              <SearchFilterItem 
                label="Número de habitaciones" 
                value="2 y 3 hab" 
                isOpen={openFilter === 'rooms'}
                onToggle={() => setOpenFilter(openFilter === 'rooms' ? null : 'rooms')}
                hasSeparator={true}
                options={[
                  { label: '1 habitación', subLabel: 'Loft / Studio' },
                  { label: '2 habitaciones', subLabel: 'Parejas' },
                  { label: '2 y 3 hab', subLabel: 'Familia pequeña' },
                  { label: '4+ habitaciones', subLabel: 'Penthouse' }
                ]}
              />
            </div>

            <div className="flex-1 w-full">
              <SearchFilterItem 
                label="Rango de precio" 
                value="$250K - $295K" 
                isOpen={openFilter === 'price'}
                onToggle={() => setOpenFilter(openFilter === 'price' ? null : 'price')}
                hasSeparator={false}
                options={[
                  { label: '$150K - $200K' },
                  { label: '$200K - $250K' },
                  { label: '$250K - $295K' },
                  { label: '$300K+' }
                ]}
              />
            </div>

            {/* Botón de Acción - SIEMPRE VISIBLE */}
            {/* En móvil: mt-3 para separarlo de los inputs, w-full para llenar el ancho.
                En desktop: ml-2 para separarlo, ancho auto.
            */}
            <div className="mt-3 lg:mt-0 lg:pl-3 w-full lg:w-auto">
              <button className="w-full lg:w-auto bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-extrabold text-[18px] py-5 px-10 rounded-[2rem] transition-all duration-300 shadow-[0_10px_30px_-5px_rgba(0,240,208,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(0,240,208,0.5)] hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-2">
                Busca tu próxima inversión
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
