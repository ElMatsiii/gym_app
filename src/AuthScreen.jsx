import { useState } from "react";
import { supabase } from "./supabase";

const AUTH_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
.auth-wrap {
  min-height: 100svh;
  background: #060810;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
}
.auth-wrap::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(255,255,255,0.012) 0px,
    rgba(255,255,255,0.012) 1px,
    transparent 1px,
    transparent 8px
  );
}
.auth-glow {
  position: fixed;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 300px;
  background: radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 70%);
  pointer-events: none;
}
.auth-card {
  background: #0a0d15;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 36px 32px;
  width: 100%;
  max-width: 360px;
  position: relative;
  z-index: 1;
  animation: auth-in 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes auth-in {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}
.auth-logo {
  font-family: 'Rajdhani', sans-serif;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 6px;
  color: #e2e8f0;
  text-align: center;
  margin-bottom: 4px;
}
.auth-logo span { color: #f59e0b; }
.auth-tagline {
  text-align: center;
  font-size: 11px;
  color: #4a5568;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 32px;
}
.auth-tabs {
  display: flex;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 24px;
}
.auth-tab {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #4a5568;
  letter-spacing: 0.05em;
}
.auth-tab.active {
  background: rgba(245,158,11,0.12);
  border: 1px solid rgba(245,158,11,0.25);
  color: #f59e0b;
}
.auth-field {
  margin-bottom: 14px;
}
.auth-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #4a5568;
  margin-bottom: 6px;
  display: block;
}
.auth-input {
  width: 100%;
  padding: 12px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: #cdd6f0;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  box-sizing: border-box;
}
.auth-input:focus {
  border-color: rgba(245,158,11,0.4);
  background: rgba(245,158,11,0.03);
}
.auth-input::placeholder { color: #2d3748; }
.auth-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 11px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #07090f;
  font-family: 'Rajdhani', sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 8px;
  transition: opacity 0.2s, transform 0.15s;
  position: relative;
  overflow: hidden;
}
.auth-btn:hover { opacity: 0.92; }
.auth-btn:active { transform: scale(0.98); }
.auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.auth-btn-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.auth-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0,0,0,0.3);
  border-top-color: #07090f;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.auth-error {
  background: rgba(244,63,94,0.08);
  border: 1px solid rgba(244,63,94,0.2);
  border-radius: 9px;
  padding: 10px 13px;
  font-size: 12px;
  color: #fb7185;
  margin-top: 12px;
  line-height: 1.5;
}
.auth-success {
  background: rgba(74,222,128,0.08);
  border: 1px solid rgba(74,222,128,0.2);
  border-radius: 9px;
  padding: 10px 13px;
  font-size: 12px;
  color: #4ade80;
  margin-top: 12px;
  line-height: 1.5;
}
.auth-divider {
  height: 1px;
  background: rgba(255,255,255,0.05);
  margin: 20px 0;
}
.auth-hint {
  font-size: 10px;
  color: #2d3748;
  text-align: center;
  line-height: 1.6;
}
`;

export default function AuthScreen({ onAuth }) {
  const [mode, setMode]         = useState("login");   // "login" | "register"
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(translateError(error.message)); return; }
    onAuth(data.user);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || username.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);

    // Check username uniqueness
    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username.trim())
      .maybeSingle();

    if (existing) {
      setLoading(false);
      setError("Ese nombre de usuario ya está en uso. Elige otro.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setLoading(false); setError(translateError(error.message)); return; }

    // Create profile row
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username: username.trim(),
      state: {},
    });

    setLoading(false);
    if (profileError) { setError("Error al crear el perfil: " + profileError.message); return; }
    onAuth(data.user);
  }

  function translateError(msg) {
    if (msg.includes("Invalid login")) return "Email o contraseña incorrectos.";
    if (msg.includes("already registered")) return "Este email ya tiene una cuenta. Inicia sesión.";
    if (msg.includes("Password should")) return "La contraseña debe tener al menos 6 caracteres.";
    if (msg.includes("Unable to validate")) return "Email inválido.";
    return msg;
  }

  return (
    <>
      <style>{AUTH_STYLES}</style>
      <div className="auth-wrap">
        <div className="auth-glow" />
        <div className="auth-card">
          <div className="auth-logo">FIT<span>RPG</span></div>
          <div className="auth-tagline">Tu entrenamiento, tu leyenda</div>

          <div className="auth-tabs">
            <button
              className={`auth-tab${mode === "login" ? " active" : ""}`}
              onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
            >
              Iniciar Sesión
            </button>
            <button
              className={`auth-tab${mode === "register" ? " active" : ""}`}
              onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
            {mode === "register" && (
              <div className="auth-field">
                <label className="auth-label">Nombre de usuario</label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="ej. maximo_fit"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            )}
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">Contraseña</label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </div>

            {error   && <div className="auth-error">⚠ {error}</div>}
            {success && <div className="auth-success">✓ {success}</div>}

            <button className="auth-btn" type="submit" disabled={loading}>
              <div className="auth-btn-inner">
                {loading && <div className="auth-spinner" />}
                {mode === "login" ? "Entrar" : "Crear cuenta"}
              </div>
            </button>
          </form>

          <div className="auth-divider" />
          <div className="auth-hint">
            {mode === "login"
              ? "¿No tienes cuenta? Cambia a Registrarse arriba."
              : "Tu progreso se guarda en la nube y estará disponible en cualquier dispositivo."}
          </div>
        </div>
      </div>
    </>
  );
}