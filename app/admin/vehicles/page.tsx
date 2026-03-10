'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const TYPES = ["Sedán", "SUV", "Pickup", "Hatchback", "Coupé", "Minivan", "Otro"];
const BRANDS = ["Toyota", "Ford", "Chevrolet", "Honda", "Volkswagen", "Renault", "Fiat", "Nissan", "Hyundai", "Peugeot", "Citroën", "Otro"];
const FUELS = ["Nafta", "Diesel", "Híbrido", "Eléctrico", "GNC", "Otro"];
const TRANSMISSIONS = ["Manual", "Automático", "CVT"];

interface Vehicle {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number | string;
    type: string;
    mileage: number;
    fuelType: string;
    transmission: string;
    color: string;
    description: string;
    images: string[] | string;
    isFeatured: boolean;
    isAvailable: boolean;
}

const emptyForm: Vehicle = {
    id: "", brand: "", model: "", year: new Date().getFullYear(), price: "",
    type: "Sedán", mileage: 0, fuelType: "Nafta", transmission: "Manual",
    color: "", description: "", images: "", isFeatured: false, isAvailable: true,
};

export default function AdminVehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Vehicle | null>(null);
    const [form, setForm] = useState<Vehicle>(emptyForm);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/admin/vehicles");
        if (res.status === 401) { router.push("/admin"); return; }
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : []);
        setLoading(false);
    }, [router]);

    useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

    function openAdd() {
        setEditing(null);
        setForm(emptyForm);
        setShowForm(true);
    }

    function openEdit(vehicle: Vehicle) {
        setEditing(vehicle);
        setForm({
            ...form, // use spread on emptyForm/base to type match partially, then overwrite
            ...vehicle,
            images: Array.isArray(vehicle.images) ? vehicle.images.join("\n") : (vehicle.images as string) || "",
            price: vehicle.price?.toString() || "",
        });
        setShowForm(true);
    }

    async function saveVehicle() {
        setSaving(true);
        const payload = {
            ...form,
            price: parseFloat(form.price as string),
            images: typeof form.images === "string"
                ? form.images.split("\n").map((u: string) => u.trim()).filter(Boolean)
                : form.images,
        };
        const url = editing ? `/api/admin/vehicles/${editing.id}` : "/api/admin/vehicles";
        const method = editing ? "PUT" : "POST";
        await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        await fetchVehicles();
        setShowForm(false);
        setSaving(false);
    }

    async function deleteVehicle(id: string) {
        if (!confirm("¿Eliminar este vehículo?")) return;
        await fetch(`/api/admin/vehicles/${id}`, { method: "DELETE" });
        setVehicles((v) => v.filter((x) => x.id !== id));
    }

    function field(key: string, label: string, type = "text", opts?: string[]) {
        return (
            <div className="form-group">
                <label className="form-label">{label}</label>
                {opts ? (
                    <select className="form-input" value={(form as any)[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}>
                        {opts.map((o) => <option key={o}>{o}</option>)}
                    </select>
                ) : type === "textarea" ? (
                    <textarea className="form-input form-textarea" value={(form as any)[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} />
                ) : (
                    <input type={type} className="form-input" value={(form as any)[key]} onChange={(e) => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))} />
                )}
            </div>
        );
    }

    return (
        <div style={{ padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)", marginBottom: 4 }}>Vehículos</h1>
                    <p style={{ color: "var(--gray-500)" }}>Gestión del inventario</p>
                </div>
                <button onClick={openAdd} className="btn btn-primary">+ Agregar Vehículo</button>
            </div>

            <div style={{ background: "white", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                        <thead>
                            <tr style={{ background: "var(--gray-50)" }}>
                                {["Vehículo", "Tipo", "Precio", "Km", "Destacado", "Disponible", ""].map((h) => (
                                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--gray-400)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} style={{ borderTop: "1px solid var(--gray-100)" }}>
                                        <td colSpan={7} style={{ padding: "14px 16px" }}><div className="skeleton" style={{ height: 20, borderRadius: 4 }} /></td>
                                    </tr>
                                ))
                            ) : vehicles.length ? (
                                vehicles.map((v) => (
                                    <tr key={v.id} style={{ borderTop: "1px solid var(--gray-100)" }}>
                                        <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--primary)" }}>{v.brand} {v.model} {v.year}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13 }}>{v.type}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                                            USD {Number(v.price).toLocaleString("es-AR")}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--gray-500)" }}>{v.mileage === 0 ? "0 km" : `${Number(v.mileage).toLocaleString("es-AR")} km`}</td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span className={v.isFeatured ? "badge badge-gold" : "badge badge-gray"}>{v.isFeatured ? "⭐ Sí" : "No"}</span>
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span className={v.isAvailable ? "badge badge-success" : "badge badge-gray"}>{v.isAvailable ? "✅ Sí" : "No"}</span>
                                        </td>
                                        <td style={{ padding: "14px 16px", display: "flex", gap: 8 }}>
                                            <button onClick={() => openEdit(v)} className="btn btn-outline btn-sm">Editar</button>
                                            <button onClick={() => deleteVehicle(v.id)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--gray-400)" }}>No hay vehículos. Agregá el primero.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
                    <div className="modal-box" style={{ maxWidth: 580, maxHeight: "90vh", overflowY: "auto" }}>
                        <button onClick={() => setShowForm(false)} style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", fontSize: 20, color: "var(--gray-400)", cursor: "pointer" }}>✕</button>
                        <h2 style={{ fontWeight: 700, color: "var(--primary)", marginBottom: 24, fontSize: 20 }}>
                            {editing ? "Editar Vehículo" : "Agregar Vehículo"}
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            {field("brand", "Marca *", "text", BRANDS)}
                            {field("model", "Modelo *")}
                            {field("year", "Año *", "number")}
                            {field("price", "Precio (USD) *", "number")}
                            {field("type", "Tipo *", "text", TYPES)}
                            {field("mileage", "Kilometraje", "number")}
                            {field("fuelType", "Combustible", "text", FUELS)}
                            {field("transmission", "Transmisión", "text", TRANSMISSIONS)}
                            {field("color", "Color")}
                        </div>
                        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                            {field("description", "Descripción", "textarea")}
                            <div className="form-group">
                                <label className="form-label">URLs de imágenes (una por línea)</label>
                                <textarea className="form-input form-textarea" value={form.images as string} onChange={(e) => setForm(f => ({ ...f, images: e.target.value }))} placeholder="https://..." />
                            </div>
                            <div style={{ display: "flex", gap: 24 }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 500, fontSize: 14 }}>
                                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                                    ⭐ Destacado
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 500, fontSize: 14 }}>
                                    <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm(f => ({ ...f, isAvailable: e.target.checked }))} />
                                    ✅ Disponible
                                </label>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                            <button onClick={saveVehicle} className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                                {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Agregar Vehículo"}
                            </button>
                            <button onClick={() => setShowForm(false)} className="btn btn-outline">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
