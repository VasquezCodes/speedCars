"use client";
import { useEffect, useState, FormEvent } from "react";
import { Plus, X, Camera, Star, Trash2, Pencil, Car, MapPin, Gauge, Search, Filter, ChevronDown, Check, MoreVertical, Loader2 } from "lucide-react";
import { sileo } from "sileo";

import { Vehicle } from '@/types/vehicle';

const POPULAR_BRANDS = [
    "Acura", "Alfa Romeo", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet",
    "Chrysler", "Citroën", "Dodge", "Ferrari", "Fiat", "Ford", "GMC",
    "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Lamborghini",
    "Land Rover", "Lexus", "Lincoln", "Maserati", "Mazda", "Mercedes-Benz",
    "Mini", "Mitsubishi", "Nissan", "Peugeot", "Porsche", "RAM", "Renault",
    "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo",
];

const colorOptions = [
    { name: "Blanco", hex: "#FFFFFF", border: "#e5e7eb" },
    { name: "Negro", hex: "#000000", border: "#000000" },
    { name: "Gris Plata", hex: "#D8D8D8", border: "#c0c0c0" },
    { name: "Gris Oscuro", hex: "#595959", border: "#404040" },
    { name: "Rojo", hex: "#CC0000", border: "#b30000" },
    { name: "Azul", hex: "#0033A0", border: "#002b80" },
    { name: "Beige", hex: "#F5F5DC", border: "#e6e6cc" },
    { name: "Marrón", hex: "#654321", border: "#54381c" },
    { name: "Verde", hex: "#2E5A27", border: "#254a20" },
    { name: "Otro", hex: "conic-gradient(from 90deg, red, yellow, lime, aqua, blue, magenta, red)", border: "#e5e7eb", isGradient: true }
];

const emptyForm: Vehicle = {
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    condition: "Usado",
    transmission: "Automático",
    fuelType: "Gasolina",
    bodyStyle: "Sedán",
    color: "Blanco",
    description: "",
    descriptionEn: "",
    images: [],
    features: [],
    status: "Disponible",
    isFeatured: false,
    type: "Auto",
    slug: ""
};

// Styling tokens for a premium, minimalist design
const colors = {
    primary: "#d11119",
    primaryHover: "#b21318",
    bg: "#ffffff",
    bgMuted: "#f8f9fa",
    textMain: "#111827",
    textMuted: "#6b7280",
    border: "#eceef1",
};

export default function AdminVehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Vehicle>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [brandIsOther, setBrandIsOther] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        if (!openMenuId) return;
        const close = () => setOpenMenuId(null);
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [openMenuId]);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/vehicles?t=" + Date.now(), { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setVehicles(data);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = form.id ? "PUT" : "POST";
            const url = form.id ? `/api/admin/vehicles/${form.id}` : "/api/admin/vehicles";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setShowForm(false);
                fetchVehicles();
                sileo.success({
                    title: form.id ? "Vehículo actualizado" : "Vehículo publicado",
                    description: `${form.brand} ${form.model} fue guardado correctamente.`,
                });
            } else {
                sileo.error({
                    title: "Error al guardar",
                    description: "No se pudo guardar el vehículo. Intentá de nuevo.",
                });
            }
        } catch (error) {
            console.error(error);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        const vehicle = vehicles.find((v) => v.id === id);
        try {
            const res = await fetch(`/api/admin/vehicles/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchVehicles();
                sileo.success({
                    title: "Vehículo eliminado",
                    description: vehicle ? `${vehicle.brand} ${vehicle.model} fue eliminado del inventario.` : "El vehículo fue eliminado.",
                });
            } else {
                sileo.error({
                    title: "Error al eliminar",
                    description: "No se pudo eliminar el vehículo.",
                });
            }
        } catch (error) {
            console.error(error);
            sileo.error({
                title: "Error de conexión",
                description: "Verificá tu conexión e intentá nuevamente.",
            });
        }
    };

    const handleEdit = (v: Vehicle) => {
        setForm(v);
        setBrandIsOther(!!v.brand && !POPULAR_BRANDS.includes(v.brand));
        setShowForm(true);
    };

    const openNewForm = () => {
        setForm(emptyForm);
        setBrandIsOther(false);
        setShowForm(true);
    };

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;
        setUploading(true);
        try {
            const fileArr = Array.from(files);
            const meta = fileArr.map((f) => ({ name: f.name, type: f.type || "image/jpeg" }));

            const signRes = await fetch("/api/admin/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ files: meta }),
            });
            const signData = await signRes.json();
            if (!signRes.ok || !signData.files) {
                sileo.error({ title: "Error al preparar la subida", description: signData.error });
                return;
            }

            const publicUrls = await Promise.all(
                fileArr.map(async (file, i) => {
                    const { uploadUrl, publicUrl } = signData.files[i];
                    const putRes = await fetch(uploadUrl, {
                        method: "PUT",
                        headers: { "Content-Type": file.type || "image/jpeg" },
                        body: file,
                    });
                    if (!putRes.ok) throw new Error(`Falló la subida de ${file.name} (${putRes.status})`);
                    return publicUrl;
                }),
            );

            setForm((f) => ({ ...f, images: [...f.images, ...publicUrls] }));
            sileo.success({ title: `${publicUrls.length} imagen(es) subida(s)` });
        } catch (err) {
            console.error("Upload error:", err);
            sileo.error({
                title: "Error al subir imágenes",
                description: err instanceof Error ? err.message : "Revisá tu conexión e intentá nuevamente.",
            });
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const removeImage = (index: number) => {
        setForm(f => {
            const arr = [...f.images];
            arr.splice(index, 1);
            return { ...f, images: arr };
        });
    };

    const makeThumbnail = (index: number) => {
        if (index === 0) return;
        setForm(f => {
            const arr = [...f.images];
            const [item] = arr.splice(index, 1);
            arr.unshift(item);
            return { ...f, images: arr };
        });
    };

    const filteredVehicles = vehicles.filter(v => 
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderInput = (key: keyof Vehicle, label: string, type = "text", placeholder = "") => {
        const isNumeric = type === "number";
        const val = form[key];
        
        let displayValue = val !== undefined && val !== null ? val.toString() : "";
        if (isNumeric && key !== "year" && displayValue) {
            displayValue = displayValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", marginLeft: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
                <input 
                    type={isNumeric ? "text" : type}
                    inputMode={isNumeric ? "numeric" : "text"}
                    placeholder={placeholder || `Ej: ${label}...`}
                    style={{ width: "100%", padding: "16px 20px", borderRadius: 16, background: "#f9fafb", border: "1px solid transparent", outline: "none", fontSize: 15, color: "#111827", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", fontFamily: "inherit", transition: "all 0.2s" }}
                    value={displayValue}
                    onChange={(e) => {
                        if (isNumeric) {
                            const numericString = e.target.value.replace(/\./g, '').replace(/\D/g, '');
                            setForm({ ...form, [key]: numericString ? Number(numericString) : "" as any });
                        } else {
                            setForm({ ...form, [key]: e.target.value });
                        }
                    }}
                    onFocus={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.border = "1px solid rgba(220,38,38,0.3)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(220,38,38,0.05)"; }}
                    onBlur={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)"; }}
                />
            </div>
        );
    };

    const renderSelect = (key: keyof Vehicle, label: string, options: string[]) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", marginLeft: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
            <div style={{ position: "relative" }}>
                <select
                    style={{ width: "100%", padding: "16px 20px", borderRadius: 16, background: "#f9fafb", border: "1px solid transparent", outline: "none", fontSize: 15, color: "#111827", appearance: "none" as const, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                    value={form[key] as any}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    onFocus={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.border = "1px solid rgba(220,38,38,0.3)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(220,38,38,0.05)"; }}
                    onBlur={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)"; }}
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown size={18} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 rounded-full border-[3px] border-gray-100 border-t-[#d11119] animate-spin" />
                <p className="text-gray-400 font-medium text-sm animate-pulse tracking-wide uppercase">Cargando inventario...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white" style={{ background: "#fff", minHeight: "100vh" }}>
            {/* Header Section */}
            <header className="admin-sticky-header" style={{ zIndex: 40, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid #f4f4f5" }}>
                <div className="max-w-400 mx-auto admin-veh-header" style={{ maxWidth: 1600, margin: "0 auto" }}>
                    <div className="admin-veh-header-inner" style={{ display: "flex" }}>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md" style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.1em", background: "#fef2f2", padding: "2px 8px", borderRadius: 6 }}>Panel Admin</span>
                            </div>
                            <h1 className="text-3xl font-black text-zinc-900 tracking-tight" style={{ fontSize: "1.875rem", fontWeight: 900, color: "#18181b", letterSpacing: "-0.02em" }}>Inventario de Vehículos</h1>
                            <p className="text-zinc-500 text-sm font-medium mt-1" style={{ color: "#71717a", fontSize: 14, fontWeight: 500, marginTop: 4 }}>Gestiona el catálogo de autos en tiempo real.</p>
                        </div>
                        
                        <button
                            onClick={openNewForm}
                            className="admin-veh-add-btn"
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 24px", background: "#18181b", color: "#fff", borderRadius: 16, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.15)", fontSize: 14, flexShrink: 0 }}
                        >
                            <Plus size={18} strokeWidth={2.5} />
                            <span>Añadir Vehículo</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Sub-header Filter & Search */}
            <div className="max-w-400 mx-auto admin-veh-search" style={{ maxWidth: 1600, margin: "0 auto" }}>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-50/50 p-2 rounded-3xl border border-zinc-100 mb-10" style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(250,250,250,0.5)", padding: 8, borderRadius: 24, border: "1px solid #f4f4f5", marginBottom: 40 }}>
                    <div className="relative flex-1 w-full group">
                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Buscar marca o modelo..."
                            className="w-full bg-transparent pl-14 pr-6 py-4 outline-none text-[15px] text-zinc-900 placeholder:text-zinc-400"
                            style={{ width: "100%", background: "transparent", paddingLeft: 56, paddingRight: 24, paddingTop: 16, paddingBottom: 16, outline: "none", fontSize: 15, color: "#18181b", border: "none" }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-px h-8 bg-zinc-200 hidden sm:block" />
                    <button className="flex items-center gap-2 px-6 py-3 text-zinc-500 hover:text-zinc-900 font-bold text-sm transition-colors">
                        <Filter size={16} />
                        <span>Filtros</span>
                        <ChevronDown size={14} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-400 mx-auto admin-veh-grid" style={{ maxWidth: 1600, margin: "0 auto" }}>
                {filteredVehicles.length === 0 ? (
                    <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-[40px] p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-white rounded-4xl flex items-center justify-center mb-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                            <Car size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {searchTerm ? "No se encontraron resultados" : "Tu inventario está vacío"}
                        </h3>
                        <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
                            {searchTerm 
                                ? `No hay coincidencias para "${searchTerm}". Intenta buscar con otros términos.`
                                : "Aún no has registrado ningún vehículo. Haz clic en el botón superior para empezar."
                            }
                        </p>
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="text-red-600 font-bold hover:underline">Limpiar búsqueda</button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 pb-20 admin-veh-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 32, paddingBottom: 80 }}>
                        {filteredVehicles.map((v) => (
                            <div key={v.id} className="group bg-white rounded-4xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full" style={{ background: "#fff", borderRadius: 32, overflow: "hidden", border: "1px solid #e4e4e7", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", transition: "all 0.3s ease" }}>
                                {/* Image Container */}
                                <div className="relative aspect-16/10 bg-zinc-100 overflow-hidden shrink-0" style={{ position: "relative", aspectRatio: "16/10", background: "#f4f4f5", overflow: "hidden", flexShrink: 0 }}>
                                    {v.images?.length > 0 ? (
                                        <img src={v.images[0]} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Camera size={40} className="text-zinc-200" />
                                        </div>
                                    )}
                                    
                                    {/* Control Badges */}
                                    <div className="absolute top-4 left-4" style={{ position: "absolute", top: 16, left: 16 }}>
                                        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-black text-zinc-900 border border-white/50 shadow-sm" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", padding: "6px 12px", borderRadius: 12, fontSize: 11, fontWeight: 900, color: "#18181b", border: "1px solid rgba(255,255,255,0.5)" }}>
                                            {v.year}
                                        </div>
                                    </div>

                                    <div className="absolute top-4 right-4" style={{ position: "absolute", top: 16, right: 16 }}>
                                        <div className="bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[14px] font-black text-white border border-white/10 shadow-lg" style={{ background: "rgba(24,24,27,0.9)", backdropFilter: "blur(8px)", padding: "8px 16px", borderRadius: 16, fontSize: 14, fontWeight: 900, color: "#fff", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                                            ${v.price.toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    {/* Quick Actions Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                        <button onClick={() => handleEdit(v)} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-zinc-900 hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-90">
                                            <Pencil size={20} />
                                        </button>
                                        <button onClick={() => v.id && handleDelete(v.id)} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-zinc-900 hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-90">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Info Section */}
                                <div className="p-6 flex-1 flex flex-col" style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
                                    <div className="flex justify-between items-start mb-6" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                                        <div>
                                            <h3 className="font-black text-xl text-zinc-900 leading-tight" style={{ fontWeight: 900, fontSize: "1.25rem", color: "#18181b", lineHeight: 1.2 }}>
                                                {v.brand}
                                            </h3>
                                            <span className="text-sm font-bold text-zinc-400 uppercase tracking-wide" style={{ fontSize: 14, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.05em" }}>{v.model}</span>
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === v.id ? null : (v.id ?? null)); }}
                                                style={{ width: 40, height: 40, borderRadius: 12, background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", color: "#a1a1aa", border: "1px solid #f4f4f5", cursor: "pointer", transition: "all 0.2s" }}
                                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d4d4d8"; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f4f4f5"; }}
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                            {openMenuId === v.id && (
                                                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 148 }}>
                                                    <button
                                                        onClick={() => { handleEdit(v); setOpenMenuId(null); }}
                                                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "inherit", color: "#111", transition: "background 0.15s" }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f4f4f5"; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                                                    >
                                                        <Pencil size={15} /> Editar
                                                    </button>
                                                    <button
                                                        onClick={() => { v.id && handleDelete(v.id); setOpenMenuId(null); }}
                                                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "inherit", color: "#ef4444", transition: "background 0.15s" }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                                                    >
                                                        <Trash2 size={15} /> Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-auto pt-6 border-t border-zinc-100" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: "auto", paddingTop: 24, borderTop: "1px solid #f4f4f5" }}>
                                        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-50/50 border border-zinc-100" style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, background: "rgba(250,250,250,0.5)", border: "1px solid #f4f4f5" }}>
                                            <Gauge size={14} className="text-zinc-400" />
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest" style={{ fontSize: 9, fontWeight: 900, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Mi</span>
                                                <span className="text-xs font-bold text-zinc-800" style={{ fontSize: 12, fontWeight: 700, color: "#27272a" }}>{v.mileage.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-50/50 border border-zinc-100" style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, background: "rgba(250,250,250,0.5)", border: "1px solid #f4f4f5" }}>
                                            <Car size={14} className="text-zinc-400" />
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest" style={{ fontSize: 9, fontWeight: 900, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Tipo</span>
                                                <span className="text-xs font-bold text-zinc-800 truncate" style={{ fontSize: 12, fontWeight: 700, color: "#27272a" }}>{v.transmission}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Premium Modal Form */}
            {showForm && (
                <div className="admin-modal-overlay" style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}>
                    <div
                        className="admin-modal-box"
                        style={{ background: "#fff", width: "100%", maxWidth: 1280, boxShadow: "0 40px 100px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", overflow: "hidden" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="admin-modal-header" style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                    <h2 className="admin-modal-title" style={{ fontWeight: 900, color: "#111827", letterSpacing: "-0.02em", margin: 0 }}>
                                        {form.id ? "Editar Vehículo" : "Nuevo Vehículo"}
                                    </h2>
                                    {form.id && <span style={{ fontSize: 12, fontWeight: 700, background: "#f3f4f6", color: "#6b7280", padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid rgba(229,231,235,0.5)", whiteSpace: "nowrap" }}>ID: {form.id.slice(0, 8)}</span>}
                                </div>
                                <p className="admin-modal-subtitle" style={{ color: "#9ca3af", fontWeight: 500, margin: 0 }}>Completa los detalles con cuidado.</p>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                className="admin-modal-close-btn"
                                style={{ borderRadius: 16, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", border: "none", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "#9ca3af"; }}
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Modal Scrollable Body */}
                        <div className="admin-modal-body">
                            <form id="vehicle-form" onSubmit={handleSubmit} className="admin-modal-cols">
                                {/* Setup/Left Part */}
                                <div className="admin-modal-left-col" style={{ display: "flex", flexDirection: "column" }}>
                                    {/* Main Specs Section */}
                                    <section>
                                        <div className="admin-modal-section-head" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 16, background: "rgba(220,38,38,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}>
                                                <Car size={20} />
                                            </div>
                                            <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#111827", textTransform: "uppercase", letterSpacing: "-0.04em" }}>Información Base</h3>
                                        </div>
                                        <div className="admin-inner-grid-2">
                                            {/* ── Brand selector ── */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", marginLeft: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Marca</label>
                                                <select
                                                    value={brandIsOther ? "__other__" : (form.brand || "")}
                                                    onChange={(e) => {
                                                        if (e.target.value === "__other__") {
                                                            setBrandIsOther(true);
                                                            setForm({ ...form, brand: "" });
                                                        } else {
                                                            setBrandIsOther(false);
                                                            setForm({ ...form, brand: e.target.value });
                                                        }
                                                    }}
                                                    style={{ width: "100%", padding: "16px 20px", borderRadius: 16, background: "#f9fafb", border: "1px solid transparent", outline: "none", fontSize: 15, color: form.brand || brandIsOther ? "#111827" : "#9ca3af", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", fontFamily: "inherit", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center", paddingRight: 44, transition: "all 0.2s" }}
                                                    onFocus={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.border = "1px solid rgba(220,38,38,0.3)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(220,38,38,0.05)"; }}
                                                    onBlur={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)"; }}
                                                >
                                                    <option value="" disabled>Seleccioná una marca...</option>
                                                    {POPULAR_BRANDS.map((b) => (
                                                        <option key={b} value={b}>{b}</option>
                                                    ))}
                                                    <option value="__other__">✏️ Otro (escribir)</option>
                                                </select>

                                                {brandIsOther && (
                                                    <input
                                                        type="text"
                                                        placeholder="Escribí la marca..."
                                                        value={form.brand}
                                                        autoFocus
                                                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                                        style={{ width: "100%", padding: "14px 20px", borderRadius: 16, background: "#fff", border: "1px solid rgba(220,38,38,0.3)", outline: "none", fontSize: 15, color: "#111827", boxShadow: "0 0 0 4px rgba(220,38,38,0.05)", fontFamily: "inherit", transition: "all 0.2s", boxSizing: "border-box" }}
                                                    />
                                                )}
                                            </div>
                                            {renderInput("model", "Modelo", "text", "Ej: Sentra")}
                                            {renderInput("year", "Año", "number", "2024")}
                                            {renderInput("price", "Precio ($)", "number", "0")}
                                            {/* Mileage in miles */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", marginLeft: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                    Millaje (mi)
                                                </label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="0"
                                                    value={form.mileage ? form.mileage.toLocaleString("en-US") : ""}
                                                    onChange={(e) => {
                                                        const raw = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10) || 0;
                                                        setForm(f => ({ ...f, mileage: raw }));
                                                    }}
                                                    style={{ padding: "14px 20px", borderRadius: 16, background: "#fff", border: "1px solid #eceef1", outline: "none", fontSize: 15, color: "#111827", fontFamily: "inherit", boxSizing: "border-box" as const }}
                                                />
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", marginLeft: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Color Exterior</label>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: "16px", background: "#f9fafb", borderRadius: 24, border: "1px solid #f3f4f6" }}>
                                                    {colorOptions.map((opt) => {
                                                        const isSelected = form.color === opt.name;
                                                        const isLight = opt.name === "Blanco" || opt.name === "Beige" || opt.name === "Plata";
                                                        return (
                                                            <button
                                                                key={opt.name}
                                                                type="button"
                                                                onClick={() => setForm({ ...form, color: opt.name })}
                                                                title={opt.name}
                                                                style={{
                                                                    width: 48,
                                                                    height: 48,
                                                                    borderRadius: "50%",
                                                                    background: opt.hex,
                                                                    cursor: "pointer",
                                                                    position: "relative",
                                                                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                                                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                                                                    boxShadow: isSelected 
                                                                        ? `0 0 0 4px #f9fafb, 0 0 0 6px ${isLight ? "#9ca3af" : opt.hex}, 0 10px 20px -5px rgba(0,0,0,0.15)` 
                                                                        : `inset 0 0 0 1px ${opt.border}, 0 2px 5px rgba(0,0,0,0.05)`,
                                                                    outline: "none",
                                                                }}
                                                            >
                                                                {isSelected && (
                                                                    <div style={{
                                                                        position: "absolute",
                                                                        inset: 0,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        color: isLight ? "#111827" : "#FFFFFF",
                                                                        opacity: 0.9
                                                                    }}>
                                                                        <Check size={22} strokeWidth={3} />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Commercial Status Section */}
                                    <section>
                                        <div className="admin-modal-section-head" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 16, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                                                <Star size={20} />
                                            </div>
                                            <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#111827", textTransform: "uppercase", letterSpacing: "-0.04em" }}>Estado Comercial</h3>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 32, background: "#f9fafb", padding: 32, borderRadius: 24, border: "1px solid #f3f4f6" }}>
                                            
                                            {/* Status Selector */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                                <label style={{ fontSize: 13, fontWeight: 700, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>Disponibilidad</label>
                                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                                    {["Disponible", "Reservado", "Vendido", "Retirado"].map(status => {
                                                        const isSelected = form.status === status;
                                                        const colors: Record<string, { bg: string, text: string, border: string }> = {
                                                            "Disponible": { bg: isSelected ? "rgba(16,185,129,0.08)" : "#fff", text: isSelected ? "#10b981" : "#6b7280", border: isSelected ? "#10b981" : "#e5e7eb" },
                                                            "Reservado": { bg: isSelected ? "rgba(245,158,11,0.08)" : "#fff", text: isSelected ? "#f59e0b" : "#6b7280", border: isSelected ? "#f59e0b" : "#e5e7eb" },
                                                            "Vendido": { bg: isSelected ? "rgba(239,68,68,0.08)" : "#fff", text: isSelected ? "#ef4444" : "#6b7280", border: isSelected ? "#ef4444" : "#e5e7eb" },
                                                            "Retirado": { bg: isSelected ? "rgba(75,85,99,0.08)" : "#fff", text: isSelected ? "#4b5563" : "#6b7280", border: isSelected ? "#4b5563" : "#e5e7eb" }
                                                        };
                                                        const style = colors[status];
                                                        
                                                        return (
                                                            <button
                                                                key={status}
                                                                type="button"
                                                                onClick={() => setForm({ ...form, status })}
                                                                style={{
                                                                    padding: "10px 24px",
                                                                    borderRadius: 100,
                                                                    fontSize: 14,
                                                                    fontWeight: isSelected ? 800 : 600,
                                                                    letterSpacing: "0.02em",
                                                                    background: style.bg,
                                                                    color: style.text,
                                                                    border: `2px solid ${style.border}`,
                                                                    cursor: "pointer",
                                                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                                    boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                                                                    transform: isSelected ? "translateY(-1px)" : "none"
                                                                }}
                                                            >
                                                                {status}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Featured Switch */}
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, borderTop: "1px solid #e5e7eb" }}>
                                                <div>
                                                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Destacar Vehículo</h4>
                                                    <p style={{ fontSize: 13, color: "#6b7280" }}>Aparecerá en la sección "Trending Cars" de la pantalla principal.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
                                                    style={{
                                                        width: 56,
                                                        height: 32,
                                                        borderRadius: 100,
                                                        background: form.isFeatured ? "#111827" : "#e5e7eb",
                                                        position: "relative",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        transition: "background 0.3s"
                                                    }}
                                                >
                                                    <div style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: "50%",
                                                        background: "#fff",
                                                        position: "absolute",
                                                        top: 4,
                                                        left: form.isFeatured ? 28 : 4,
                                                        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                                    }} />
                                                </button>
                                            </div>
                                            
                                        </div>
                                    </section>

                                    {/* Technical Specs Section */}
                                    <section>
                                        <div className="admin-modal-section-head" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 16, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                                                <Gauge size={20} />
                                            </div>
                                            <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#111827", textTransform: "uppercase", letterSpacing: "-0.04em" }}>Datos Técnicos</h3>
                                        </div>
                                        <div className="admin-inner-grid-2">
                                            {renderSelect("condition", "Condición", ["Nuevo", "Usado", "Certificado"])}
                                            {renderSelect("transmission", "Transmisión", ["Automático", "Manual", "CVT", "Dual-Clutch"])}
                                            {renderSelect("fuelType", "Combustible", ["Gasolina", "Diésel", "Híbrido", "Eléctrico", "GLP"])}
                                            {renderSelect("bodyStyle", "Carrocería", ["Sedán", "SUV", "Hatchback", "Pickup", "Coupé", "Convertible"])}
                                        </div>
                                    </section>

                                    {/* Description */}
                                    <section>
                                        <div className="admin-modal-section-head" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 16, background: "rgba(217,119,6,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
                                                <Search size={20} />
                                            </div>
                                            <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#111827", textTransform: "uppercase", letterSpacing: "-0.04em" }}>Descripción Detallada</h3>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", marginLeft: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Descripción en Español</label>
                                                <textarea
                                                    style={{ width: "100%", padding: "20px 24px", borderRadius: 24, background: "#f9fafb", border: "1px solid transparent", outline: "none", fontSize: 15, color: "#111827", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", resize: "none", fontFamily: "inherit", transition: "all 0.2s" }}
                                                    rows={4}
                                                    placeholder="Describe el estado, equipamiento y detalles especiales..."
                                                    value={form.description}
                                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                    onFocus={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.border = "1px solid rgba(220,38,38,0.3)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(220,38,38,0.05)"; }}
                                                    onBlur={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)"; }}
                                                />
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", marginLeft: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description in English</label>
                                                <textarea
                                                    style={{ width: "100%", padding: "20px 24px", borderRadius: 24, background: "#f9fafb", border: "1px solid transparent", outline: "none", fontSize: 15, color: "#111827", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", resize: "none", fontFamily: "inherit", transition: "all 0.2s" }}
                                                    rows={4}
                                                    placeholder="Describe the vehicle condition, features and special details..."
                                                    value={form.descriptionEn ?? ""}
                                                    onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                                                    onFocus={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.border = "1px solid rgba(220,38,38,0.3)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(220,38,38,0.05)"; }}
                                                    onBlur={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)"; }}
                                                />
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Media/Right Part */}
                                <div className="admin-modal-right-col" style={{ display: "flex", flexDirection: "column" }}>
                                    <div style={{ position: "sticky", top: 0, display: "flex", flexDirection: "column", gap: 40 }}>
                                        <section>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <div style={{ width: 40, height: 40, borderRadius: 16, background: "rgba(79,70,229,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                                                        <Camera size={20} />
                                                    </div>
                                                    <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#111827", textTransform: "uppercase", letterSpacing: "-0.04em" }}>Contenido Visual</h3>
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "6px 12px", borderRadius: 12, border: "1px solid #e0e7ff" }}>{form.images.length} Archivos</span>
                                            </div>

                                            <label
                                                style={{ width: "100%", height: 192, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "3px dashed #e5e7eb", borderRadius: 40, background: uploading ? "#f9fafb" : "rgba(249,250,251,0.5)", cursor: uploading ? "wait" : "pointer", transition: "all 0.3s", position: "relative", overflow: "hidden" }}
                                                onMouseEnter={(e) => { if (!uploading) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(220,38,38,0.05)"; } }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = uploading ? "#f9fafb" : "rgba(249,250,251,0.5)"; e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                    style={{ display: "none" }}
                                                />
                                                {uploading ? (
                                                    <>
                                                        <Loader2 size={32} style={{ color: "#dc2626", animation: "spin 1s linear infinite" }} />
                                                        <p style={{ fontWeight: 700, color: "#4b5563", marginTop: 16 }}>Subiendo...</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div style={{ width: 64, height: 64, background: "#fff", borderRadius: 24, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", border: "1px solid #f9fafb", marginBottom: 16 }}>
                                                            <Plus size={24} />
                                                        </div>
                                                        <p style={{ fontWeight: 700, color: "#4b5563", letterSpacing: "-0.02em" }}>Cargar Imágenes</p>
                                                        <span style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, textTransform: "uppercase", fontWeight: 900, letterSpacing: "0.1em" }}>JPG, PNG, WEBP • Máx 10MB</span>
                                                    </>
                                                )}
                                            </label>
                                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                                            {form.images.length > 0 && (
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 32 }}>
                                                    {form.images.map((img, idx) => (
                                                        <div key={`${img}-${idx}`} className="group" style={{ position: "relative", aspectRatio: "4/3", borderRadius: 24, overflow: "hidden", background: "#f3f4f6", border: idx === 0 ? "2px solid #dc2626" : "1px solid #f3f4f6", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.5s" }}>
                                                            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />

                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                            {idx === 0 ? (
                                                                <div style={{ position: "absolute", top: 12, left: 12, background: "#dc2626", color: "#fff", padding: 8, borderRadius: 12, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 6 }}>
                                                                    <Star size={12} fill="white" />
                                                                    <span>Principal</span>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => makeThumbnail(idx)}
                                                                    style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", color: "#111", border: "none", padding: "6px 12px", borderRadius: 10, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                                                                >
                                                                    <Star size={10} />
                                                                    Hacer Portada
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(idx)}
                                                                style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, background: "rgba(0,0,0,0.75)", border: "none", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.3)", transition: "background 0.15s" }}
                                                                onMouseEnter={(e) => { e.currentTarget.style.background = "#dc2626"; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.75)"; }}
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>
                                        
                                        {/* Status Reminder Card */}
                                        <div style={{ padding: 32, borderRadius: 32, background: "#f9fafb", border: "1px solid rgba(243,244,246,0.5)", display: "flex", alignItems: "flex-start", gap: 16 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 16, background: "#fff", border: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#22c55e" }}>
                                                <Check size={18} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>Carga Inteligente</h4>
                                                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>Las imágenes se optimizan automáticamente. La primera imagen será la que vean los clientes en el catálogo principal.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Action Footer */}
                        <div className="admin-modal-footer" style={{ borderTop: "1px solid #f3f4f6" }}>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="admin-modal-discard-btn"
                                style={{ padding: "16px 32px", borderRadius: 16, fontWeight: 700, color: "#6b7280", background: "transparent", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "inherit", transition: "all 0.2s" }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#111827"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "#6b7280"; }}
                            >
                                Descartar Cambios
                            </button>
                            <button
                                form="vehicle-form"
                                type="submit"
                                disabled={saving}
                                className="admin-modal-save-btn"
                                style={{ padding: "20px 48px", borderRadius: 24, fontWeight: 900, fontSize: 16, color: "#fff", background: saving ? "#9ca3af" : "#d11119", boxShadow: "0 8px 32px rgba(209,17,25,0.3)", border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.5 : 1, transition: "all 0.3s", fontFamily: "inherit" }}
                                onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.background = "#18181b"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                                onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.background = "#d11119"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(209,17,25,0.3)"; e.currentTarget.style.transform = "translateY(0)"; } }}
                            >
                                {saving ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                                        <span>Procesando...</span>
                                    </div>
                                ) : (
                                    <span>Publicar Vehículo</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

