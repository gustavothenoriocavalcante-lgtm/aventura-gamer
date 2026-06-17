// AdminPanel — Admin login and management panel
// Design: "Caderno de Aventuras" — clean admin interface

import { useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { LogIn, LogOut, Shield, Plus, Trash2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ─── Admin Login Form ─────────────────────────────────────────────────────────
function AdminLoginForm({ onClose }: { onClose: () => void }) {
  const { login, loginError } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login realizado com sucesso!");
      onClose();
    } catch {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-scale-in"
        style={{ border: "2px solid #22c55e" }}
      >
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderBottom: "1px solid #bbf7d0" }}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <h2 className="text-xl text-green-800" style={{ fontFamily: "Fredoka One, cursive" }}>
              Painel Admin
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5" style={{ fontFamily: "Nunito, sans-serif" }}>
              Email
            </label>
            <Input
              type="email"
              placeholder="admin@escola.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-green-200 focus:border-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5" style={{ fontFamily: "Nunito, sans-serif" }}>
              Senha
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="border-green-200 focus:border-green-400"
            />
          </div>
          {loginError && (
            <p className="text-red-500 text-sm">{loginError}</p>
          )}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
            style={{ fontFamily: "Fredoka One, cursive" }}
          >
            <LogIn className="w-4 h-4 mr-2" />
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Ad Manager ───────────────────────────────────────────────────────────────
function AdManager() {
  const [newAd, setNewAd] = useState({ image: "", url: "", title: "" });
  const [adding, setAdding] = useState(false);

  const handleAddAd = async () => {
    if (!newAd.image || !newAd.url) {
      toast.error("Preencha a URL da imagem e o link!");
      return;
    }
    setAdding(true);
    try {
      await addDoc(collection(db, "ads"), {
        ...newAd,
        active: true,
        createdAt: serverTimestamp(),
      });
      setNewAd({ image: "", url: "", title: "" });
      toast.success("Anúncio adicionado!");
    } catch {
      toast.error("Erro ao adicionar anúncio.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-700" style={{ fontFamily: "Fredoka One, cursive" }}>
        Gerenciar Anúncios
      </h3>
      <div className="space-y-2">
        <Input
          placeholder="URL da imagem"
          value={newAd.image}
          onChange={(e) => setNewAd({ ...newAd, image: e.target.value })}
          className="border-green-200 text-sm"
        />
        <Input
          placeholder="Link de destino (https://...)"
          value={newAd.url}
          onChange={(e) => setNewAd({ ...newAd, url: e.target.value })}
          className="border-green-200 text-sm"
        />
        <Input
          placeholder="Título do anúncio (opcional)"
          value={newAd.title}
          onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
          className="border-green-200 text-sm"
        />
        <Button
          onClick={handleAddAd}
          disabled={adding}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
          style={{ fontFamily: "Fredoka One, cursive" }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Anúncio
        </Button>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
export function AdminPanel() {
  const { isAdmin, logout } = useAdmin();
  const [showLogin, setShowLogin] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  if (!isAdmin) {
    return (
      <>
        <button
          onClick={() => setShowLogin(true)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-green-50"
          style={{ fontFamily: "Space Mono, monospace" }}
        >
          <Shield className="w-3.5 h-3.5" />
          Admin
        </button>
        {showLogin && <AdminLoginForm onClose={() => setShowLogin(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPanel(true)}
          className="flex items-center gap-1.5 text-xs text-green-700 bg-green-100 hover:bg-green-200 transition-colors px-3 py-1.5 rounded-lg font-bold"
          style={{ fontFamily: "Space Mono, monospace" }}
        >
          <Shield className="w-3.5 h-3.5" />
          Painel Admin
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Admin Panel Modal */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto animate-scale-in"
            style={{ border: "2px solid #22c55e" }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between sticky top-0"
              style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderBottom: "1px solid #bbf7d0" }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <h2 className="text-xl text-green-800" style={{ fontFamily: "Fredoka One, cursive" }}>
                  Painel de Administração
                </h2>
              </div>
              <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700 font-semibold" style={{ fontFamily: "Nunito, sans-serif" }}>
                ✅ Logado como administrador. Você pode editar, deletar e fixar posts no fórum diretamente.
              </div>

              <AdManager />

              <div className="border-t border-green-100 pt-4">
                <p className="text-xs text-gray-400" style={{ fontFamily: "Nunito, sans-serif" }}>
                  Para gerenciar posts do fórum, use os botões de editar/deletar/fixar que aparecem em cada post quando você está logado como admin.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
