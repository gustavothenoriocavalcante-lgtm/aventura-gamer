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
  where,
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

function PostCard({
  post,
  replies,
  onReply,
  allPosts,
}: {
  post: ForumPost;
  replies: ForumPost[];
  onReply: (postId: string, authorName: string) => void;
  allPosts: ForumPost[];
}) {
  const { isAdmin } = useAdmin();
  const [showReplies, setShowReplies] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.message);

  const handleDelete = async () => {
    if (!confirm("Deletar esta mensagem?")) return;
    try {
      await deleteDoc(doc(db, "forum", post.id));
      // Delete replies too
      for (const reply of replies) {
        await deleteDoc(doc(db, "forum", reply.id));
      }
      toast.success("Mensagem deletada!");
    } catch {
      toast.error("Erro ao deletar. Firebase não configurado?");
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

  return (
    <div className={`forum-post p-4 ${post.pinned ? "border-green-400 bg-green-50/50" : ""}`}>
      {post.pinned && (
        <div className="flex items-center gap-1 text-xs text-green-600 font-bold mb-2" style={{ fontFamily: "Space Mono, monospace" }}>
          <Pin className="w-3 h-3 fill-green-500" /> FIXADO
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <img
          src={post.avatar}
          alt={post.author}
          className="w-9 h-9 rounded-xl object-cover border-2 border-green-200 flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/avatar1-aZsFtVQBPFrDYdtUVzEMQV.webp";
          }}
        />

        <div className="flex-1 min-w-0">
          {/* Author + time */}
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

          {/* Message */}
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
          <div className="flex items-center gap-3 mt-2">
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

            {/* Admin actions */}
            {isAdmin && (
              <>
                <button
                  onClick={handlePin}
                  className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-700 transition-colors"
                >
                  <Pin className="w-3 h-3" />
                  {post.pinned ? "Desafixar" : "Fixar"}
                </button>
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

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="ml-12 mt-3 space-y-2 border-l-2 border-green-100 pl-3">
          {replies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-2">
              <img
                src={reply.avatar}
                alt={reply.author}
                className="w-7 h-7 rounded-lg object-cover border border-green-200 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/avatar1-aZsFtVQBPFrDYdtUVzEMQV.webp";
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700 text-xs" style={{ fontFamily: "Fredoka One, cursive" }}>
                    {reply.author}
                  </span>
                  <span className="text-xs text-gray-400" style={{ fontFamily: "Space Mono, monospace" }}>
                    {timeAgo(reply.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5" style={{ fontFamily: "Nunito, sans-serif" }}>
                  {reply.message}
                </p>
              </div>
            </div>
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

  // Load posts from Firestore
  useEffect(() => {
    const q = query(collection(db, "forum"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ForumPost));
        // Sort: pinned first, then by date
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
    if (!profile) {
      toast.error("Crie seu perfil primeiro!");
      return;
    }
    setIsPosting(true);
    try {
      await addDoc(collection(db, "forum"), {
        author: profile.name,
        avatar: profile.avatar,
        message: newMessage.trim(),
        createdAt: serverTimestamp(),
        replyTo: replyTo?.id || null,
        pinned: false,
      });
      setNewMessage("");
      setReplyTo(null);
      toast.success("Mensagem enviada!");
    } catch {
      toast.error("Erro ao enviar. Configure o Firebase para usar o fórum!");
    } finally {
      setIsPosting(false);
    }
  };

  const handleReply = (postId: string, authorName: string) => {
    setReplyTo({ id: postId, author: authorName });
    inputRef.current?.focus();
  };

  // Separate top-level posts from replies
  const topLevelPosts = posts.filter((p) => !p.replyTo);
  const getReplies = (postId: string) => posts.filter((p) => p.replyTo === postId);

  return (
    <section className="py-8">
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
          <strong>⚠️ Firebase não configurado.</strong> Configure as variáveis de ambiente para ativar o fórum online. As mensagens serão perdidas ao recarregar.
        </div>
      )}

      {/* New post input */}
      <div
        className="bg-white rounded-2xl border-2 border-green-200 p-4 mb-5"
        style={{ boxShadow: "0 2px 8px rgba(34,197,94,0.08)" }}
      >
        {profile && (
          <div className="flex items-center gap-2 mb-3">
            <img src={profile.avatar} alt={profile.name} className="w-8 h-8 rounded-xl object-cover border-2 border-green-200" />
            <span className="font-bold text-sm text-gray-700" style={{ fontFamily: "Fredoka One, cursive" }}>
              {profile.name}
            </span>
            {replyTo && (
              <span className="game-tag">
                Respondendo {replyTo.author}
                <button onClick={() => setReplyTo(null)} className="ml-1 text-green-600 hover:text-green-800">×</button>
              </span>
            )}
          </div>
        )}
        {!profile && (
          <p className="text-sm text-gray-500 mb-3" style={{ fontFamily: "Nunito, sans-serif" }}>
            Crie seu perfil para participar do fórum!
          </p>
        )}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={profile ? "Escreva sua mensagem..." : "Crie um perfil primeiro..."}
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

      {/* Posts list */}
      {topLevelPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
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
            />
          ))}
        </div>
      )}
    </section>
  );
}
