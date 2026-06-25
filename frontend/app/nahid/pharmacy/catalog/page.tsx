"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi } from "@/lib/nahid-api";
import { Search, ShoppingCart, Pill, Loader2, Plus, Minus, CheckCircle } from "lucide-react";

export default function PharmacyCatalogPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ medicine: any; quantity: number }[]>([]);
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await nahidApi.getMedicines({ search: search || undefined, limit: 100 });
        setMedicines(data);
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  function addToCart(med: any) {
    setCart((prev) => {
      const ex = prev.find((i) => i.medicine.id === med.id);
      if (ex) return prev.map((i) => i.medicine.id === med.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { medicine: med, quantity: 1 }];
    });
  }

  function updateQty(id: number, delta: number) {
    setCart((prev) => prev.map((i) => i.medicine.id === id ? { ...i, quantity: i.quantity + delta } : i).filter((i) => i.quantity > 0));
  }

  const getQty = (id: number) => cart.find((i) => i.medicine.id === id)?.quantity || 0;
  const cartTotal = cart.reduce((sum, i) => sum + (i.medicine.wholesale_price || i.medicine.retail_price || 0) * i.quantity, 0);

  async function handleOrder() {
    if (cart.length === 0) return;
    setOrdering(true);
    try {
      await nahidApi.createOrder({
        order_type: "b2b",
        items: cart.map((item) => ({
          medicine_id: item.medicine.id,
          quantity: item.quantity,
          unit_price: item.medicine.wholesale_price || item.medicine.retail_price || 0,
        })),
      });
      setSuccess("B2B order placed successfully!");
      setCart([]);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setOrdering(false);
    }
  }

  return (
    <NahidShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Wholesale Catalog</h1>
          <p className="text-sm text-slate-400">Order medicines at wholesale prices</p>
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle className="h-5 w-5" /> {success}
          </div>
        )}

        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          {cart.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2.5">
              <ShoppingCart className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-white">{cart.length} items · ${cartTotal.toFixed(2)}</span>
              <button onClick={handleOrder} disabled={ordering} className="ml-2 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-400 disabled:opacity-60 flex items-center gap-1">
                {ordering && <Loader2 className="h-3 w-3 animate-spin" />}
                Place B2B Order
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Medicine</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">SKU</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Wholesale Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">MRP</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {medicines.map((med) => {
                  const qty = getQty(med.id);
                  return (
                    <tr key={med.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white text-sm">{med.product_name}</p>
                        <p className="text-xs text-slate-400">{med.generic_name}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{med.sku}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-400">
                        {med.wholesale_price ? `$${Number(med.wholesale_price).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-400">
                        {med.retail_price ? `$${Number(med.retail_price).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {qty === 0 ? (
                          <button onClick={() => addToCart(med)} className="mx-auto flex items-center gap-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-xs text-blue-300 hover:bg-blue-500/30">
                            <ShoppingCart className="h-3.5 w-3.5" /> Add
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => updateQty(med.id, -1)} className="text-slate-400 hover:text-white">
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium text-white">{qty}</span>
                            <button onClick={() => updateQty(med.id, 1)} className="text-slate-400 hover:text-white">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </NahidShell>
  );
}
