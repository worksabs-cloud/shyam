"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi } from "@/lib/nahid-api";
import { Search, ShoppingCart, Plus, Minus, Pill, Loader2, CheckCircle } from "lucide-react";

interface CartItem {
  medicine: any;
  quantity: number;
}

export default function CustomerMedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await nahidApi.getMedicines({ search: search || undefined, limit: 50 });
        setMedicines(data);
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  function addToCart(medicine: any) {
    setCart((prev) => {
      const existing = prev.find((i) => i.medicine.id === medicine.id);
      if (existing) return prev.map((i) => i.medicine.id === medicine.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { medicine, quantity: 1 }];
    });
  }

  function updateQty(medicineId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => i.medicine.id === medicineId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    );
  }

  function getQty(medicineId: number) {
    return cart.find((i) => i.medicine.id === medicineId)?.quantity || 0;
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.medicine.retail_price || 0) * item.quantity, 0);

  async function handlePlaceOrder() {
    if (cart.length === 0) return;
    setOrdering(true);
    try {
      await nahidApi.createOrder({
        order_type: "b2c",
        items: cart.map((item) => ({
          medicine_id: item.medicine.id,
          quantity: item.quantity,
          unit_price: item.medicine.retail_price || 0,
        })),
      });
      setOrderSuccess("Order placed successfully!");
      setCart([]);
      setTimeout(() => setOrderSuccess(""), 5000);
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
          <h1 className="text-2xl font-bold text-white">Shop Medicines</h1>
          <p className="text-sm text-slate-400">Browse and order medicines online</p>
        </div>

        {orderSuccess && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle className="h-5 w-5" /> {orderSuccess}
          </div>
        )}

        <div className="flex gap-4 flex-col sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5">
              <ShoppingCart className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-white">{cart.length} items · ${cartTotal.toFixed(2)}</span>
              <button
                onClick={handlePlaceOrder}
                disabled={ordering}
                className="ml-2 flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-400 disabled:opacity-60"
              >
                {ordering ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Order Now
              </button>
            </div>
          )}
        </div>

        {/* Medicine Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : medicines.length === 0 ? (
          <div className="py-12 text-center">
            <Pill className="mx-auto mb-2 h-8 w-8 text-slate-600" />
            <p className="text-slate-500">No medicines found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {medicines.map((med) => {
              const qty = getQty(med.id);
              return (
                <div key={med.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                    <Pill className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white text-sm leading-tight">{med.product_name}</h3>
                  {med.generic_name && <p className="text-xs text-slate-400 mt-0.5">{med.generic_name}</p>}
                  {med.manufacturer && <p className="text-xs text-slate-500">{med.manufacturer}</p>}

                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      {med.dosage && <p className="text-xs text-slate-400">{med.dosage}</p>}
                      <p className="font-bold text-emerald-400">
                        {med.retail_price ? `$${Number(med.retail_price).toFixed(2)}` : "Price on request"}
                      </p>
                    </div>
                    {med.prescription_required && (
                      <span className="text-xs text-amber-400 bg-amber-500/20 rounded-full px-2 py-0.5">Rx</span>
                    )}
                  </div>

                  <div className="mt-3">
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(med)}
                        disabled={!med.retail_price}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 py-2 text-sm text-emerald-300 hover:bg-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
                        <button onClick={() => updateQty(med.id, -1)} className="text-emerald-400 hover:text-emerald-300">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-medium text-white">{qty}</span>
                        <button onClick={() => updateQty(med.id, 1)} className="text-emerald-400 hover:text-emerald-300">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </NahidShell>
  );
}
