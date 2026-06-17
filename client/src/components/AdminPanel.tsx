// AdminPanel — Admin login and management panel
// Design: "Caderno de Aventuras" — clean admin interface

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // Importação necessária para o Portal
import { useAdmin } from "@/contexts/AdminContext";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { LogIn, LogOut, Shield, Plus, Trash2, Edit2, Check, X } from "lucide-react";
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

  // O formulário de login também usa Portal para evitar sumir da tela
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
    </div>,
    document.body
  );
}

interface AdItem {
  id: string;
  title?: string;
  image: string;
  url: string;
}

// ─── Ad Manager (Criar, Editar e Excluir Propagandas) ───────────────────────────
function AdManager() {
  const [newAd, setNewAd] = useState({ image: "", url: "", title: "" });
  const [adding, setAdding] = useState(false);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsList: AdItem[] = [];
      snapshot.forEach((doc) => {
        adsList.push({ id: doc.id, ...doc.data() } as AdItem);
      });
      setAds(adsList);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveAd = async () => {
    if (!newAd.image || !newAd.url) {
      toast.error("Preencha a URL da imagem e o link!");
      return;
    }
    setAdding(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "ads", editingId), {
          ...newAd,
          updatedAt: serverTimestamp(),
        });
        toast.success("Anúncio atualizado com sucesso!");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "ads"), {
          ...newAd,
          active: true,
          createdAt: serverTimestamp(),
        });
        toast.success("Anúncio adicionado!");
      }
      setNewAd({ image: "", url: "", title: "" });
    } catch {
      toast.error("Erro ao salvar anúncio.");
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (ad: AdItem) => {
    setEditingId(ad.id);
    setNewAd({
      image: ad.image,
      url: ad.url,
      title: ad.title || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewAd({ image: "", url: "", title: "" });
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta propaganda?")) return;
    try {
      await deleteDoc(doc(db, "ads", id));
      toast.success("Anúncio removido!");
      if (editingId === id) handleCancelEdit();
    } catch {
      toast.error("Erro ao remover anúncio.");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-700" style={{ fontFamily: "Fredoka One, cursive" }}>
        Gerenciar Anúncios
      </h3>
      <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs text-gray-500 font-semibold">
            {editingId ? "✏️ Editando Anúncio:" : "✨ Novo Anúncio:"}
          </p>
          {editingId && (
            <button onClick={handleCancelEdit} className="text-xs text-red-500 hover:underline">
              Cancelar edição
            </button>
          )}
        </div>
        <Input
          placeholder="URL da imagem"
          value={newAd.image}
          onChange={(e) => setNewAd({ ...newAd, image: e.target.value })}
          className="border-green-200 text-sm bg-white"
        />
        <Input
          placeholder="Link de destino (https://...)"
          value={newAd.url}
          onChange={(e) => setNewAd({ ...newAd, url: e.target.value })}
          className="border-green-200 text-sm bg-white"
        />
        <Input
          placeholder="Título do anúncio (opcional)"
          value={newAd.title}
          onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
          className="border-green-200 text-sm bg-white"
        />
        <Button
          onClick={handleSaveAd}
          disabled={adding}
          className={`w-full text-white font-bold ${editingId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}`}
          style={{ fontFamily: "Fredoka One, cursive" }}
        >
          {editingId ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {editingId ? (adding ? "Salvando..." : "Salvar Alterações") : (adding ? "Adicionando..." : "Adicionar Anúncio")}
        </Button>
      </div>

      <div className="space-y-2 mt-4">
        <p className="text-xs font-bold text-gray-500">Anúncios Ativos ({ads.length}):</p>
        {ads.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Nenhum anúncio cadastrado.</p>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {ads.map((ad) => (
              <div 
                key={ad.id} 
                className={`flex items-center justify-between p-2 bg-white border rounded-xl text-xs gap-2 shadow-sm transition-colors ${editingId === ad.id ? 'border-blue-400 bg-blue-50/30' : 'border-green-100'}`}
              >
                <div className="flex items-center gap-2 truncate flex-1">
                  <img src={ad.image} alt="Preview" className="w-8 h-8 rounded object-cover border border-gray-200 flex-shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-gray-700 truncate">{ad.title || "Sem título"}</p>
                    <p className="text-gray-400 truncate text-[10px]">{ad.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleStartEdit(ad)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar Anúncio"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAd(ad.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir Anúncio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
      {/* Botões originais da barra (Ficam guardados na barra de forma correta e limpa) */}
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

      {/* PORTAL DO REACT: Retira a modal de dentro do Header e joga direto para a raiz da página */}
      {showPanel && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-scale-in"
            style={{ border: "2px solid #22c55e" }}
          >
            {/* Cabeçalho Fixo */}
            <div
              className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
              style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderBottom: "1px solid #bbf7d0" }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <h2 className="text-xl text-green-800" style={{ fontFamily: "Fredoka One, cursive" }}>
                  Painel de Administração
                </h2>
              </div>
              <button 
                onClick={() => setShowPanel(false)} 
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-green-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo rolável */}
            <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1">
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
        </div>,
        document.body // Alvo do portal: Renderiza no body da aplicação
      )}
    </>
  );
}