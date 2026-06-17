// Forum — Online community forum with Firebase Firestore
// Design: "Caderno de Aventuras" — Discord/Reddit inspired, school aesthetic
// No account required — uses local profile (name + avatar)

import { useState, useEffect, useRef } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { MessageSquare, Send, Reply, Pin, Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/contexts/AdminContext";

export interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  message: string;
  createdAt: Timestamp | null;
  replyTo: string | null; // parent post id
  pinned?: boolean;
  edited?: boolean;
}

function timeAgo(ts: Timestamp | null): string {
  if (!ts) return "agora";
  const now = Date.now();
  const diff = now - ts.toMillis();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

// ─── Subcomponente de Resposta (ReplyRow) ─────────────────────────────────────
function ReplyRow({ 
  reply, 
  currentUserName, 
  isAdmin,
  onReplyToUser 
}: { 
  reply: ForumPost; 
  currentUserName: string; 
  isAdmin: boolean;
  onReplyToUser: (authorName: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(reply.message);

  const handleDeleteReply = async () => {
    if (!confirm("Deletar esta resposta?")) return;
    try {
      await deleteDoc(doc(db, "forum", reply.id));
      toast.success("Resposta deletada!");
    } catch {
      toast.error("Erro ao deletar resposta.");
    }
  };

  const handleEditReply = async () => {
    if (!editText.trim()) return;
    try {
      await updateDoc(doc(db, "forum", reply.id), { message: editText.trim(), edited: true });
      setEditing(false);
      toast.success("Resposta editada!");
    } catch {
      toast.error("Erro ao editar resposta.");
    }
  };

  const canManage = isAdmin || reply.author === currentUserName;

  return (
    <div className="flex items-start gap-2 group bg-gray-50/50 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
      <img
        src={reply.avatar}
        alt={reply.author}
        className="w-7 h-7 rounded-lg object-cover border border-green-200 flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/avatar1-aZsFtVQBPFrDYdtUVzEMQV.webp";
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-gray-700 text-xs" style={{ fontFamily: "Fredoka One, cursive" }}>
            {reply.author}
          </span>
          <span className="text-[10px] text-gray-400" style={{ fontFamily: "Space Mono, monospace" }}>
            {timeAgo(reply.createdAt)}
          </span>
          {reply.edited && (
            <span className="text-[10px] text-gray-400 italic">(editado)</span>
          )}
        </div>

        {editing ? (
          <div className="mt-1 flex gap-2">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 text-xs px-2 py-1 border border-green-300 rounded-lg focus:outline-none focus:border-green-500"
              style={{ fontFamily: "Nunito, sans-serif" }}
              onKeyDown={(e) => e.key === "Enter" && handleEditReply()}
            />
            <button onClick={handleEditReply} className="text-green-600 hover:text-green-800 text-[10px] font-bold">Salvar</button>
            <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600 text-[10px]">Cancelar</button>
          </div>
        ) : (
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed" style={{ fontFamily: "Nunito, sans-serif" }}>
            {reply.message}
          </p>
        )}

        {/* Botões de Ações da Resposta */}
        {!editing && (
          <div className="flex items-center gap-2 mt-1 opacity-60 group-hover:opacity-100 transition-opacity flex-wrap">
            {/* 🌟 NOVO: Botão para responder diretamente uma resposta mencionando o usuário */}
            <button
              onClick={() => onReplyToUser(reply.author)}
              className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-green-600 transition-colors"
            >
              <Reply className="w-2.5 h-2.5" />
              Responder
            </button>

            {canManage && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-0.5 text-[10px] text-blue-500 hover:text-blue-700 transition-colors"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                  Editar
                </button>
                <button
                  onClick={handleDeleteReply}
                  className="flex items-center gap-0.5 text-[10px] text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  Deletar
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente do Cartão do Post (PostCard) ───────────────────────────────────
function PostCard({
  post,
  replies,
  onReply,
  currentUserName,
}: {
  post: ForumPost;
  replies: ForumPost[];
  onReply: (postId: string, authorName: string, mentionUser?: string) => void;
  allPosts: ForumPost[];
  currentUserName: string;
}) {
  const { isAdmin } = useAdmin();
  const [showReplies, setShowReplies] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.message);

  const handleDelete = async () => {
    if (!confirm("Deletar esta mensagem?")) return;
    try {
      await deleteDoc(doc(db, "forum", post.id));
      for (const reply of replies) {
        await deleteDoc(doc(db, "forum", reply.id));
      }
      toast.success("Mensagem deletada!");
    } catch {
      toast.error("Erro ao deletar.");
    }
  };

  const handlePin = async () => {
    try {
      await updateDoc(doc(db, "forum", post.id), { pinned: !post.pinned });
      toast.success(post.pinned ? "Post desafixado!" : "Post fixado!");
    } catch {
      toast.error("Erro ao fixar post.");
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    try {
      await updateDoc(doc(db, "forum", post.id), { message: editText.trim(), edited: true });
      setEditing(false);
      toast.success("Mensagem editada!");
    } catch {
      toast.error("Erro ao editar.");
    }
  };

  const canManagePost = isAdmin || post.author === currentUserName;

  return (
    <div className={`forum-post p-4 ${post.pinned ? "border-green-400 bg-green-50/50" : ""}`}>
      {post.pinned && (
        <div className="flex items-center gap-1 text-xs text-green-600 font-bold mb-2" style={{ fontFamily: "Space Mono, monospace" }}>
          <Pin className="w-3 h-3 fill-green-500" /> FIXADO
        </div>
      )}

      <div className="flex items-start gap-3">
        <img
          src={post.avatar}
          alt={post.author}
          className="w-9 h-9 rounded-xl object-cover border-2 border-green-200 flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/avatar1-aZsFtVQBPFrDYdtUVzEMQV.webp";
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-800 text-sm" style={{ fontFamily: "Fredoka One, cursive" }}>
              {post.author}
            </span>
            <span className="text-xs text-gray-400" style={{ fontFamily: "Space Mono, monospace" }}>
              {timeAgo(post.createdAt)}
            </span>
            {post.edited && (
              <span className="text-xs text-gray-400 italic">(editado)</span>
            )}
          </div>

          {editing ? (
            <div className="mt-1.5 flex gap-2">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 text-sm px-2 py-1 border border-green-300 rounded-lg focus:outline-none focus:border-green-500"
                style={{ fontFamily: "Nunito, sans-serif" }}
                onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              />
              <button onClick={handleEdit} className="text-green-600 hover:text-green-800 text-xs font-bold">Salvar</button>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600 text-xs">Cancelar</button>
            </div>
          ) : (
            <p className="text-sm text-gray-700 mt-1 leading-relaxed" style={{ fontFamily: "Nunito, sans-serif" }}>
              {post.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <button
              onClick={() => onReply(post.id, post.author)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              <Reply className="w-3 h-3" />
              Responder
            </button>

            {replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-semibold transition-colors"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {replies.length} {replies.length === 1 ? "resposta" : "respostas"}
              </button>
            )}

            {isAdmin && (
              <button
                onClick={handlePin}
                className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-700 transition-colors"
              >
                <Pin className="w-3 h-3" />
                {post.pinned ? "Desafixar" : "Fixar"}
              </button>
            )}

            {canManagePost && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Deletar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Replies List */}
      {showReplies && replies.length > 0 && (
        <div className="ml-12 mt-3 space-y-2 border-l-2 border-green-100 pl-3">
          {replies.map((reply) => (
            <ReplyRow 
              key={reply.id} 
              reply={reply} 
              currentUserName={currentUserName} 
              isAdmin={isAdmin} 
              // Quando clica em responder uma resposta interna, avisa o fórum para marcar o autor
              onReplyToUser={(authorName) => onReply(post.id, post.author, authorName)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Forum Component ─────────────────────────────────────────────────────
export function Forum() {
  const { profile } = usePlayer();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [firebaseError, setFirebaseError] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentUserName = profile?.name || "";

  // Load posts from Firestore
  useEffect(() => {
    const q = query(collection(db, "forum"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ForumPost));
        data.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
        setPosts(data);
        setFirebaseError(false);
      },
      () => {
        setFirebaseError(true);
      }
    );
    return () => unsub();
  }, []);

  const handlePost = async () => {
    if (!newMessage.trim()) return;

    setIsPosting(true);

    try {
      await addDoc(collection(db, "forum"), {
        author: profile?.name || "Anônimo",
        avatar: profile?.avatar || "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/avatar1-aZsFtVQBPFrDYdtUVzEMQV.webp",
        message: newMessage.trim(),
        replyTo: replyTo?.id || null, 
        createdAt: serverTimestamp(),
      });

      setNewMessage("");
      setReplyTo(null); 
    } catch (e) {
      console.log("ERRO FIREBASE:", e);
      toast.error("Erro ao enviar mensagem.");
    } finally {
      setIsPosting(false);
    }
  };

  // 🌟 MODIFICADO: Aceita opcionalmente o nome do usuário específico da resposta
  const handleReply = (postId: string, authorName: string, mentionUser?: string) => {
    setReplyTo({ id: postId, author: authorName });
    
    if (mentionUser) {
      // Se tiver um usuário específico, adiciona o @ dele na caixa de texto automaticamente
      setNewMessage(`@${mentionUser} `);
    } else {
      setNewMessage("");
    }
    
    // Força abrir as respostas visivelmente se o usuário clicar
    inputRef.current?.focus();
  };

  const topLevelPosts = posts.filter((p) => !p.replyTo);
  
  // Organiza as respostas de forma linear baseada na ordem de criação (mais antigas primeiro)
  const getReplies = (postId: string) => {
    return posts
      .filter((p) => p.replyTo === postId)
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return a.createdAt.toMillis() - b.createdAt.toMillis();
      });
  };

  return (
    <section className="pt-24 pb-8 px-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-3xl text-gray-800" style={{ fontFamily: "Fredoka One, cursive" }}>
          💬 Fórum da Turma
        </h2>
        <span className="game-tag">
          {topLevelPosts.length} posts
        </span>
      </div>
      <hr className="dashed-separator" />

      {firebaseError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-700" style={{ fontFamily: "Nunito, sans-serif" }}>
          <strong>⚠️ Firebase não configurado.</strong> Configure as variáveis de ambiente para ativar o fórum online.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* COLUNA DA ESQUERDA: Card de Perfil */}
        <div className="lg:col-span-1 sticky top-24 bg-white rounded-2xl border-2 border-green-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 mb-3" style={{ fontFamily: "Space Mono, monospace" }}>SEU PERFIL</p>
          {profile ? (
            <div className="flex flex-col items-center text-center gap-2">
              <img src={profile.avatar} alt={profile.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-green-400 shadow-sm" />
              <span className="font-bold text-base text-gray-800" style={{ fontFamily: "Fredoka One, cursive" }}>
                {profile.name}
              </span>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Online</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500" style={{ fontFamily: "Nunito, sans-serif" }}>
              Crie seu perfil para participar do fórum!
            </p>
          )}
        </div>

        {/* COLUNA DA DIREITA: Caixa de Texto + Mensagens */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-green-200 p-4 shadow-sm">
            {replyTo && (
              <div className="mb-2">
                <span className="game-tag">
                  Respondendo a discussão de {replyTo.author}
                  <button onClick={() => { setReplyTo(null); setNewMessage(""); }} className="ml-1 text-green-600 hover:text-green-800">×</button>
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={profile ? "Escreva sua mensagem aqui no fórum..." : "Crie um perfil primeiro..."}
                disabled={!profile || isPosting}
                rows={2}
                className="flex-1 text-sm px-3 py-2 border border-green-200 rounded-xl focus:outline-none focus:border-green-400 resize-none disabled:opacity-50 disabled:bg-gray-50"
                style={{ fontFamily: "Nunito, sans-serif" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handlePost();
                  }
                }}
              />
              <button
                onClick={handlePost}
                disabled={!profile || isPosting || !newMessage.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-bold self-end"
                style={{ fontFamily: "Fredoka One, cursive" }}
              >
                <Send className="w-4 h-4" />
                Enviar
              </button>
            </div>
          </div>

          {/* Lista de Mensagens */}
          {topLevelPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p style={{ fontFamily: "Nunito, sans-serif" }}>Nenhuma mensagem ainda. Seja o primeiro!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topLevelPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  replies={getReplies(post.id)}
                  onReply={handleReply}
                  allPosts={posts}
                  currentUserName={currentUserName}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}