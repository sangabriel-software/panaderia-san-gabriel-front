import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClipboard,
  FiClock,
  FiEdit2,
  FiEye,
  FiFileText,
  FiGlobe,
  FiInbox,
  FiList,
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiPlus,
  FiSave,
  FiSend,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import useGetEncuestasList from "../../hooks/Encuestas/useGetEncuestasList";
import {
  crearCampania,
  //modificarCampania,
  eliminarCampania,
  consultarCampaniaDetalle,
  createEncuestaObject,
  getStatus,
  formatDate,
  validateFormData,
  calculateStats,
  getInitialFormData,
  getInitialQuestion,
} from "./CreateSurvey.utils";

// ─── Constantes y clases reutilizadas ──────────────────────────────────────────
// Utilidades explícitas (sin .card/.btn-* globales) para no chocar con Bootstrap
// mientras termina la migración del resto de pantallas.

const CARD = "rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5";
const INPUT =
  "w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-base text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";
const ICONO_CAMPO =
  "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-600 dark:text-brand-400";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2.5 text-md font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none";
const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-md font-medium text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50";
const BTN_ICON =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

const FORMATO_FECHA_HORA = "YYYY-MM-DD HH:mm:ss";

const TIPOS = [
  {
    valor: "online",
    label: "Online",
    Icono: FiGlobe,
    tone: "bg-brand-500/15 text-brand-600 dark:text-brand-300",
    activo:
      "peer-checked:border-brand-500/60 peer-checked:bg-brand-500/15 peer-checked:text-brand-700 dark:peer-checked:text-brand-300",
  },
  {
    valor: "presencial",
    label: "Presencial",
    Icono: FiUsers,
    tone: "bg-accent-500/15 text-accent-600 dark:text-accent-300",
    activo:
      "peer-checked:border-accent-500/60 peer-checked:bg-accent-500/15 peer-checked:text-accent-700 dark:peer-checked:text-accent-300",
  },
  {
    valor: "telefonica",
    label: "Telefónica",
    Icono: FiPhone,
    tone: "bg-warning-500/15 text-warning-700 dark:text-warning-300",
    activo:
      "peer-checked:border-warning-500/60 peer-checked:bg-warning-500/15 peer-checked:text-warning-700 dark:peer-checked:text-warning-300",
  },
  {
    valor: "email",
    label: "Email",
    Icono: FiMail,
    tone: "bg-success-500/15 text-success-700 dark:text-success-300",
    activo:
      "peer-checked:border-success-500/60 peer-checked:bg-success-500/15 peer-checked:text-success-700 dark:peer-checked:text-success-300",
  },
];

const TIPO_DEFAULT = {
  valor: "otro",
  label: "Encuesta",
  Icono: FiClipboard,
  tone: "bg-brand-500/15 text-brand-600 dark:text-brand-300",
};

const tipoDe = (type) =>
  TIPOS.find((t) => t.valor === String(type ?? "").toLowerCase()) ?? TIPO_DEFAULT;

const TIPOS_PREGUNTA = [
  { valor: "pregunta", label: "Opción múltiple", corto: "Opción múltiple", Icono: FiCheckCircle },
  { valor: "texto", label: "Texto libre", corto: "Texto libre", Icono: FiMessageSquare },
];

const TABS = [
  { id: "list", label: "Encuestas", Icono: FiList },
  { id: "create", label: "Nueva", Icono: FiPlus },
  { id: "results", label: "Resultados", Icono: FiBarChart2 },
];

// El estado viene de getStatus(); aquí solo se traduce a un color.
// Si tus textos de estado son otros, ajusta las expresiones regulares.
const statusTone = (status) => {
  const t = `${status?.text ?? ""} ${status?.className ?? ""}`.toLowerCase();
  if (/inactiv|finaliz|vencid|cerrad|expir/.test(t))
    return "bg-surface-2 text-muted";
  if (/program|pendiente|pr[oó]xim/.test(t))
    return "bg-warning-500/15 text-warning-700 dark:text-warning-300";
  if (/activ|curso|vigente/.test(t))
    return "bg-success-500/15 text-success-700 dark:text-success-300";
  return "bg-surface-2 text-muted";
};

const renumerar = (preguntas) => preguntas.map((q, i) => ({ ...q, orden: i + 1 }));

// ─── Piezas pequeñas ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, tone, title, subtitle }) => (
  <div className="flex items-center gap-3">
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
      <Icon size={17} />
    </span>
    <div className="min-w-0">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
    </div>
  </div>
);

const Field = ({ label, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-muted">
      {label}
    </label>
    <div className="relative">{children}</div>
  </div>
);

const StatTile = ({ label, value, tone }) => (
  <div className="rounded-2xl border border-line bg-surface p-3.5 shadow-card sm:p-4">
    <p className="text-sm text-muted">{label}</p>
    <p className={`mt-1 text-4xl font-bold tabular-nums ${tone}`}>{value}</p>
  </div>
);

const EstadoBadge = ({ status }) => (
  <span
    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(status)}`}
  >
    {status?.text}
  </span>
);

const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className={`${CARD} flex flex-col items-center gap-2 py-12 text-center animate-fade-in`}>
    <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
      <Icon size={26} />
    </span>
    <h3 className="text-xl font-semibold text-ink">{title}</h3>
    <p className="max-w-sm text-md text-muted">{text}</p>
    {action}
  </div>
);

const SkeletonCards = () => (
  <div className="grid gap-3 md:grid-cols-2" aria-busy="true">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className={`${CARD} space-y-4`}>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-surface-2" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
        <div className="h-12 animate-pulse rounded-xl bg-surface-2" />
      </div>
    ))}
  </div>
);

const InfoRow = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 border-b border-line/60 py-2 last:border-0">
    <span className="text-sm text-muted">{label}</span>
    <span className="text-md font-medium text-ink">{children}</span>
  </div>
);

// ─── Editor de preguntas (compartido por crear y editar) ───────────────────────
// Permite agregar, editar el texto, cambiar tipo/obligatoriedad, reordenar y quitar.

const QuestionsEditor = ({ preguntas, setPreguntas }) => {
  const [draft, setDraft] = useState(() => getInitialQuestion(preguntas.length + 1));
  const obligatoriaDraft = Number(draft.obligatoria) === 1;

  const actualizar = (index, cambios) =>
    setPreguntas(renumerar(preguntas.map((q, i) => (i === index ? { ...q, ...cambios } : q))));

  const quitar = (index) => setPreguntas(renumerar(preguntas.filter((_, i) => i !== index)));

  const mover = (index, direccion) => {
    const destino = index + direccion;
    if (destino < 0 || destino >= preguntas.length) return;
    const copia = [...preguntas];
    [copia[index], copia[destino]] = [copia[destino], copia[index]];
    setPreguntas(renumerar(copia));
  };

  const agregar = () => {
    if (!draft.pregunta.trim()) {
      toast.error("Por favor, ingresa el texto de la pregunta");
      return;
    }
    setPreguntas([
      ...preguntas,
      {
        ...draft,
        orden: preguntas.length + 1,
        fechaCreacion: dayjs().format(FORMATO_FECHA_HORA),
      },
    ]);
    setDraft(getInitialQuestion(preguntas.length + 2));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Nueva pregunta */}
      <div className="space-y-3 rounded-2xl border border-line bg-bg p-3.5">
        <span className="text-sm font-semibold text-muted">Nueva pregunta #{preguntas.length + 1}</span>

        <Field label="Texto de la pregunta" htmlFor="pregunta-nueva">
          <input
            id="pregunta-nueva"
            type="text"
            autoComplete="off"
            placeholder="¿Qué te pareció nuestro servicio?"
            className={`${INPUT} bg-surface`}
            value={draft.pregunta}
            onChange={(e) => setDraft((prev) => ({ ...prev, pregunta: e.target.value }))}
            onKeyDown={(e) => {
              // Enter agrega la pregunta en lugar de enviar todo el formulario
              if (e.key === "Enter") {
                e.preventDefault();
                agregar();
              }
            }}
          />
        </Field>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-muted">Tipo de pregunta</legend>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS_PREGUNTA.map(({ valor, label, Icono }) => (
              <label key={valor} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="tipo-pregunta-nueva"
                  value={valor}
                  checked={draft.tipo === valor}
                  onChange={() => setDraft((prev) => ({ ...prev, tipo: valor }))}
                  className="peer sr-only"
                />
                <span className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2.5 text-md font-semibold text-muted transition-colors hover:bg-surface-2 peer-checked:border-brand-500/60 peer-checked:bg-brand-500/15 peer-checked:text-brand-700 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/40 dark:peer-checked:text-brand-300">
                  <Icono size={16} />
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5">
          <span className="text-md font-medium text-ink">Pregunta obligatoria</span>
          <input
            type="checkbox"
            className="peer sr-only"
            checked={obligatoriaDraft}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, obligatoria: e.target.checked ? 1 : 0 }))
            }
          />
          <span className="relative h-6 w-11 shrink-0 rounded-full bg-surface-2 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/40" />
        </label>

        <button type="button" onClick={agregar} className={`${BTN_SECONDARY} w-full`}>
          <FiPlus size={16} />
          Agregar pregunta
        </button>
      </div>

      {/* Preguntas agregadas (editables) */}
      {preguntas.length > 0 ? (
        <div>
          <h3 className="mb-2 text-md font-semibold text-ink">
            Preguntas agregadas ({preguntas.length})
          </h3>
          <ol className="flex flex-col gap-2">
            {preguntas.map((q, index) => (
              <li
                key={index}
                className="rounded-xl border border-line bg-bg p-3 animate-fade-in"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-sm font-semibold text-brand-700 dark:text-brand-300">
                    {q.orden}
                  </span>

                  <div className="min-w-0 flex-1 space-y-2">
                    <input
                      type="text"
                      autoComplete="off"
                      aria-label={`Texto de la pregunta ${q.orden}`}
                      className={`${INPUT} bg-surface`}
                      value={q.pregunta}
                      onChange={(e) => actualizar(index, { pregunta: e.target.value })}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
                        {TIPOS_PREGUNTA.map(({ valor, corto }) => (
                          <button
                            key={valor}
                            type="button"
                            aria-pressed={q.tipo === valor}
                            onClick={() => actualizar(index, { tipo: valor })}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                              q.tipo === valor
                                ? "bg-brand-600 text-white"
                                : "text-muted hover:text-ink"
                            }`}
                          >
                            {corto}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        aria-pressed={Number(q.obligatoria) === 1}
                        onClick={() =>
                          actualizar(index, { obligatoria: Number(q.obligatoria) === 1 ? 0 : 1 })
                        }
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          Number(q.obligatoria) === 1
                            ? "bg-warning-500/15 text-warning-700 dark:text-warning-300"
                            : "bg-surface-2 text-muted"
                        }`}
                      >
                        {Number(q.obligatoria) === 1 ? "Obligatoria" : "Opcional"}
                      </button>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col">
                    <button
                      type="button"
                      onClick={() => mover(index, -1)}
                      disabled={index === 0}
                      aria-label="Subir pregunta"
                      title="Subir"
                      className={BTN_ICON}
                    >
                      <FiChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(index, 1)}
                      disabled={index === preguntas.length - 1}
                      aria-label="Bajar pregunta"
                      title="Bajar"
                      className={BTN_ICON}
                    >
                      <FiChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => quitar(index)}
                      aria-label="Eliminar pregunta"
                      title="Eliminar"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line py-6 text-center text-md text-muted">
          Aún no hay preguntas agregadas
        </p>
      )}
    </div>
  );
};

// ─── Formulario de encuesta (compartido por crear y editar) ────────────────────

const SurveyForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitting,
  submitLabel,
  submittingLabel,
  SubmitIcon,
  minFechaInicio,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setPreguntas = (preguntas) => setFormData((prev) => ({ ...prev, preguntas }));
  const total = formData.preguntas.length;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* ── Datos de la campaña ── */}
        <section className={`${CARD} space-y-4`}>
          <SectionHeader
            icon={FiClipboard}
            tone="bg-brand-500/15 text-brand-600 dark:text-brand-300"
            title="Datos de la campaña"
            subtitle="Información general de la encuesta"
          />

          <Field label="Nombre de la campaña" htmlFor="nombreCampania">
            <input
              id="nombreCampania"
              name="nombreCampania"
              type="text"
              autoComplete="off"
              placeholder="Ej: Encuesta de Satisfacción 2025"
              className={INPUT}
              value={formData.nombreCampania}
              onChange={handleChange}
            />
          </Field>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-muted">Tipo de encuesta</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {TIPOS.map(({ valor, label, Icono, activo }) => (
                <label key={valor} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="tipoEncuesta"
                    value={valor}
                    checked={formData.tipoEncuesta === valor}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border border-line bg-bg px-2 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/40 ${activo}`}
                  >
                    <Icono size={16} />
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field label="Descripción" htmlFor="descripcion">
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              placeholder="Describe el propósito de esta encuesta"
              className={`${INPUT} resize-none`}
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Field label="Fecha de inicio" htmlFor="fechaInicio">
              <FiCalendar size={16} className={ICONO_CAMPO} />
              <input
                id="fechaInicio"
                name="fechaInicio"
                type="date"
                min={minFechaInicio}
                className={`${INPUT} pl-10`}
                value={formData.fechaInicio}
                onChange={handleChange}
              />
            </Field>
            <Field label="Fecha de fin" htmlFor="fechaFin">
              <FiCalendar size={16} className={ICONO_CAMPO} />
              <input
                id="fechaFin"
                name="fechaFin"
                type="date"
                min={formData.fechaInicio}
                className={`${INPUT} pl-10`}
                value={formData.fechaFin}
                onChange={handleChange}
              />
            </Field>
          </div>
        </section>

        {/* ── Preguntas ── */}
        <section className={`${CARD} flex flex-col gap-4`}>
          <SectionHeader
            icon={FiList}
            tone="bg-accent-500/15 text-accent-600 dark:text-accent-300"
            title="Preguntas de la encuesta"
            subtitle="Agrega, edita y ordena las preguntas"
          />
          <QuestionsEditor preguntas={formData.preguntas} setPreguntas={setPreguntas} />
        </section>
      </div>

      {/* ── Barra de acción fija ── */}
      <div className="sticky bottom-4 z-10">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-modal backdrop-blur">
          <p className="flex min-w-0 items-center gap-2 pl-1 text-md text-muted">
            {total > 0 ? (
              <FiCheckCircle size={16} className="shrink-0 text-success-600 dark:text-success-400" />
            ) : (
              <span className="h-2 w-2 shrink-0 rounded-full bg-warning-500" />
            )}
            <span className="truncate">
              {total > 0
                ? `${total} pregunta${total === 1 ? "" : "s"} lista${total === 1 ? "" : "s"}`
                : "Agrega al menos una pregunta"}
            </span>
          </p>

          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={onCancel} disabled={submitting} className={BTN_SECONDARY}>
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className={BTN_PRIMARY}>
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                  {submittingLabel}
                </>
              ) : (
                <>
                  <SubmitIcon size={16} />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

// ─── Tarjeta de encuesta (con confirmación de borrado en línea, sin modal) ─────

const SurveyCard = ({
  encuesta,
  confirming,
  deleting,
  onDetails,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}) => {
  const status = getStatus(encuesta);
  const tipo = tipoDe(encuesta.type);
  const Icono = tipo.Icono;

  return (
    <article className={`${CARD} flex flex-col gap-4 animate-fade-in`}>
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tipo.tone}`}
        >
          <Icono size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-ink">{encuesta.title}</h3>
          <p className="truncate text-sm text-muted">
            {encuesta.descripcion || "Sin descripción"}
          </p>
        </div>
        <EstadoBadge status={status} />
      </div>

      <dl className="grid grid-cols-3 gap-2 rounded-xl bg-bg p-3">
        <div>
          <dt className="text-xs text-muted">Preguntas</dt>
          <dd className="text-lg font-semibold tabular-nums text-ink">{encuesta.questions || 0}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Respuestas</dt>
          <dd className="text-lg font-semibold tabular-nums text-ink">{encuesta.responses || 0}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Creada</dt>
          <dd className="truncate text-md font-medium text-ink">{formatDate(encuesta.created)}</dd>
        </div>
      </dl>

      {confirming ? (
        <div
          role="alertdialog"
          aria-label="Confirmar eliminación"
          className="flex flex-col gap-3 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-start gap-2 text-md text-ink">
            <FiAlertTriangle size={16} className="mt-0.5 shrink-0 text-danger-600 dark:text-danger-400" />
            ¿Eliminar esta encuesta? Esta acción no se puede deshacer.
          </p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={onCancelDelete} disabled={deleting} className={BTN_SECONDARY}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-0 bg-danger-600 px-4 py-2.5 text-md font-semibold text-white shadow-danger transition-colors hover:bg-danger-500 active:bg-danger-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {deleting ? (
                <>
                  <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                  Eliminando...
                </>
              ) : (
                "Sí, eliminar"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={onDetails} className={`${BTN_SECONDARY} flex-1`}>
            <FiEye size={16} />
            Ver detalles
          </button>
          <button
            type="button"
            onClick={onAskDelete}
            aria-label="Eliminar encuesta"
            title="Eliminar encuesta"
            className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:border-danger-500/40 hover:bg-danger-500/10 hover:text-danger-600"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )}
    </article>
  );
};

// ─── Vista de detalle + edición (reemplaza al modal) ───────────────────────────

const DetailView = ({ details, loading, error, onBack, tipoFallback, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  const detalle = details?.detalle;
  const preguntas = details?.preguntas ?? [];

  const startEdit = () => {
    setForm({
      ...getInitialFormData(),
      nombreCampania: detalle.nombreCampania ?? "",
      tipoEncuesta: String(detalle.tipoEncuesta ?? tipoFallback ?? "online").toLowerCase(),
      descripcion: detalle.descripcion ?? "",
      fechaInicio: dayjs(detalle.fechaInicio).format("YYYY-MM-DD"),
      fechaFin: dayjs(detalle.fechaFin).format("YYYY-MM-DD"),
      preguntas: preguntas.map((p, i) => ({
        pregunta: p.pregunta ?? "",
        tipo: p.tipo ?? "pregunta",
        obligatoria: Number(p.obligatoria ?? 1),
        orden: i + 1,
        fechaCreacion: p.fechaCreacion ?? dayjs().format(FORMATO_FECHA_HORA),
      })),
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    if (saving) return;
    setEditing(false);
    setForm(null);
  };

  const submitEdit = async (e) => {
    e.preventDefault();

    const validation = validateFormData(form);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);

    if (ok) {
      setEditing(false);
      setForm(null);
    }
  };

  const header = (
    <header className="flex items-center gap-3">
      <button
        type="button"
        onClick={editing ? cancelEdit : onBack}
        aria-label={editing ? "Cancelar edición" : "Volver a la lista"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
      >
        <FiArrowLeft size={17} />
      </button>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-xl font-bold text-ink">
          {editing ? "Editar encuesta" : detalle?.nombreCampania || "Detalles de la encuesta"}
        </h2>
        {detalle && (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
              ID {detalle.idCampania}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                detalle.activa
                  ? "bg-success-500/15 text-success-700 dark:text-success-300"
                  : "bg-surface-2 text-muted"
              }`}
            >
              {detalle.activa ? "Activa" : "Inactiva"}
            </span>
          </div>
        )}
      </div>
      {detalle && !editing && !loading && (
        <button type="button" onClick={startEdit} className={`${BTN_SECONDARY} shrink-0`}>
          <FiEdit2 size={15} />
          <span className="hidden sm:inline">Editar</span>
        </button>
      )}
    </header>
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <div className="grid gap-3 md:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <EmptyState
          icon={FiAlertTriangle}
          title="No se pudieron cargar los detalles"
          text="Intenta de nuevo en unos momentos."
          action={
            <button type="button" onClick={onBack} className={`${BTN_SECONDARY} mt-3`}>
              Volver a la lista
            </button>
          }
        />
      </div>
    );
  }

  // ── Modo edición ──
  if (editing && form) {
    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        {header}
        <SurveyForm
          formData={form}
          setFormData={setForm}
          onSubmit={submitEdit}
          onCancel={cancelEdit}
          submitting={saving}
          submitLabel="Guardar cambios"
          submittingLabel="Guardando..."
          SubmitIcon={FiSave}
        />
      </div>
    );
  }

  // ── Modo lectura ──
  const duracion = dayjs(detalle.fechaFin).diff(dayjs(detalle.fechaInicio), "day");
  const tieneTexto = preguntas.some((p) => p.tipo === "texto");
  const tipo = tipoDe(detalle.tipoEncuesta ?? tipoFallback);

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {header}

      <div className="grid gap-3 md:grid-cols-2">
        <section className={`${CARD} md:col-span-2`}>
          <SectionHeader
            icon={FiFileText}
            tone="bg-brand-500/15 text-brand-600 dark:text-brand-300"
            title="Descripción"
          />
          <p className="mt-3 text-md text-ink">{detalle.descripcion || "Sin descripción"}</p>
        </section>

        <section className={CARD}>
          <SectionHeader
            icon={FiCalendar}
            tone="bg-accent-500/15 text-accent-600 dark:text-accent-300"
            title="Fechas"
          />
          <div className="mt-2">
            <InfoRow label="Inicio">{dayjs(detalle.fechaInicio).format("DD/MM/YYYY")}</InfoRow>
            <InfoRow label="Fin">{dayjs(detalle.fechaFin).format("DD/MM/YYYY")}</InfoRow>
            <InfoRow label="Duración">{duracion} días</InfoRow>
          </div>
        </section>

        <section className={CARD}>
          <SectionHeader
            icon={FiClock}
            tone="bg-warning-500/15 text-warning-700 dark:text-warning-300"
            title="Información"
          />
          <div className="mt-2">
            <InfoRow label="Creada por">
              <span className="inline-flex items-center gap-1.5">
                <FiUser size={14} className="text-muted" />
                {detalle.usuario || "Usuario desconocido"}
              </span>
            </InfoRow>
            <InfoRow label="Tipo de encuesta">{tipo.label}</InfoRow>
            <InfoRow label="Preguntas">{preguntas.length}</InfoRow>
            <InfoRow label="Tipo de preguntas">{tieneTexto ? "Mixto" : "Opción múltiple"}</InfoRow>
          </div>
        </section>
      </div>

      <section className={`${CARD} space-y-3`}>
        <SectionHeader
          icon={FiList}
          tone="bg-success-500/15 text-success-700 dark:text-success-300"
          title={`Preguntas (${preguntas.length})`}
        />
        {preguntas.length > 0 ? (
          <ol className="flex flex-col gap-2">
            {preguntas.map((p, index) => (
              <li
                key={p.idPregunta ?? index}
                className="flex items-start gap-3 rounded-xl border border-line bg-bg p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-sm font-semibold text-brand-700 dark:text-brand-300">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-md text-ink">{p.pregunta}</p>
                  <span
                    className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.tipo === "pregunta"
                        ? "bg-accent-500/15 text-accent-700 dark:text-accent-300"
                        : "bg-warning-500/15 text-warning-700 dark:text-warning-300"
                    }`}
                  >
                    {p.tipo === "pregunta" ? "Opción múltiple" : "Texto libre"}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="py-4 text-center text-md text-muted">No hay preguntas en esta encuesta</p>
        )}
      </section>
    </div>
  );
};

// ─── Página principal ──────────────────────────────────────────────────────────

const GestionarEncuestasPage = () => {
  const { encuestas, loading, showError, setEncuestas } = useGetEncuestasList();

  const [tab, setTab] = useState("list");

  // Detalle (vista en la misma página, sin modal)
  const [detailId, setDetailId] = useState(null);
  const [surveyDetails, setSurveyDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const detailRequest = useRef(0);

  // Eliminación con confirmación en línea
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Formulario de creación
  const [formData, setFormData] = useState(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTimer = useRef(null);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const lista = encuestas ?? [];
  const stats = calculateStats(lista);

  // ── Navegación entre pestañas ────────────────────────────────────────────────

  const cambiarTab = (id) => {
    if (id !== "list") cerrarDetalle();
    setConfirmId(null);
    setTab(id);
  };

  // ── Detalle ──────────────────────────────────────────────────────────────────

  const cerrarDetalle = () => {
    detailRequest.current += 1;
    setDetailId(null);
    setSurveyDetails(null);
    setDetailError(false);
    setLoadingDetails(false);
  };

  const handleViewDetails = async (encuestaId) => {
    const reqId = ++detailRequest.current;
    setDetailId(encuestaId);
    setSurveyDetails(null);
    setDetailError(false);
    setLoadingDetails(true);

    try {
      const existente = lista.find((e) => e.id === encuestaId);
      let detalles = existente?.detalles;

      if (!detalles) {
        const response = await consultarCampaniaDetalle(encuestaId);
        detalles = response.campania;
        setEncuestas((prev) =>
          prev.map((e) => (e.id === encuestaId ? { ...e, detalles } : e))
        );
      }

      if (reqId === detailRequest.current) setSurveyDetails(detalles);
    } catch (error) {
      if (reqId === detailRequest.current) {
        setDetailError(true);
        toast.error(error.message || "Error al cargar los detalles de la encuesta.");
      }
    } finally {
      if (reqId === detailRequest.current) setLoadingDetails(false);
    }
  };

  // ── Edición ──────────────────────────────────────────────────────────────────
  // Envía a modificarCampania el mismo payload que crearCampania, más el id de la encuesta.
  // Devuelve true si se guardó, para que la vista de detalle salga del modo edición.

  const handleSaveEdit = async (form) => {
    const id = detailId;
    if (id === null) return false;

    try {
      const response = await modificarCampania({ ...form, idCampania: id });

      // Se vuelven a pedir los detalles para mostrar lo que realmente quedó guardado
      let detalles = null;
      try {
        const consulta = await consultarCampaniaDetalle(id);
        detalles = consulta.campania;
      } catch (e) {
        console.error("No se pudieron recargar los detalles tras guardar:", e);
      }

      if (!detalles) {
        // Respaldo local si la recarga falla
        detalles = {
          ...(surveyDetails ?? {}),
          detalle: {
            ...(surveyDetails?.detalle ?? {}),
            nombreCampania: form.nombreCampania,
            tipoEncuesta: form.tipoEncuesta,
            descripcion: form.descripcion,
            fechaInicio: form.fechaInicio,
            fechaFin: form.fechaFin,
          },
          preguntas: form.preguntas.map((q) => ({
            pregunta: q.pregunta,
            tipo: q.tipo,
            obligatoria: q.obligatoria,
          })),
        };
      }

      // Se actualiza la tarjeta de la lista conservando respuestas, fecha de creación e id
      setEncuestas((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;

          let base;
          try {
            base = createEncuestaObject(form, {
              ...(response && typeof response === "object" ? response : {}),
              idCampania: id,
            });
          } catch {
            base = {
              title: form.nombreCampania,
              descripcion: form.descripcion,
              type: form.tipoEncuesta,
              questions: form.preguntas.length,
            };
          }

          return {
            ...e,
            ...base,
            id: e.id,
            responses: e.responses,
            created: e.created,
            detalles,
          };
        })
      );

      setSurveyDetails(detalles);
      toast.success("Encuesta actualizada correctamente");
      return true;
    } catch (error) {
      console.error("Error al modificar la encuesta:", error);
      toast.error(error.message || "Error al guardar los cambios. Por favor, intenta de nuevo.");
      return false;
    }
  };

  // ── Eliminación ──────────────────────────────────────────────────────────────

  const executeDeleteSurvey = async (encuestaId) => {
    setDeletingId(encuestaId);
    try {
      await eliminarCampania(encuestaId);
      setEncuestas((prev) => prev.filter((e) => e.id !== encuestaId));
      toast.success("La encuesta ha sido eliminada exitosamente.");
      setConfirmId(null);
    } catch (error) {
      console.error("Error al eliminar la encuesta:", error);
      toast.error(error.message || "Error al eliminar la encuesta. Por favor, intenta de nuevo.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Creación ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateFormData(formData);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await crearCampania(formData);

      // Detalles inmediatamente después de crear, para no pedirlos de nuevo al abrirla
      const detallesResponse = await consultarCampaniaDetalle(response.idCampania);

      const nuevaEncuesta = {
        ...createEncuestaObject(formData, response),
        detalles: detallesResponse.campania,
      };

      setEncuestas((prev) => [nuevaEncuesta, ...prev]);
      setFormData(getInitialFormData());

      toast.success("¡Encuesta creada exitosamente!");

      // Descarga automática del PDF con el código QR y regreso a la lista
      redirectTimer.current = setTimeout(() => {
        const link = document.createElement("a");
        link.href = "/CdigoQR_SanGabriel.pdf"; // archivo en /public
        link.download = "CdigoQR_SanGabriel.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTab("list");
      }, 2000);
    } catch (error) {
      console.error("Error al crear la encuesta:", error);
      toast.error(error.message || "Error al crear la encuesta. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Secciones ────────────────────────────────────────────────────────────────

  const renderLista = () => {
    if (detailId !== null) {
      return (
        <DetailView
          key={detailId}
          details={surveyDetails}
          loading={loadingDetails}
          error={detailError}
          onBack={cerrarDetalle}
          tipoFallback={lista.find((e) => e.id === detailId)?.type}
          onSave={handleSaveEdit}
        />
      );
    }

    if (loading) return <SkeletonCards />;

    return (
      <div className="flex flex-col gap-4">
        {showError && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-md text-ink"
          >
            <FiAlertTriangle size={17} className="shrink-0 text-danger-600 dark:text-danger-400" />
            Hubo un error al cargar las encuestas. Intenta más tarde...
          </div>
        )}

        {lista.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatTile label="Encuestas" value={stats.total} tone="text-ink" />
              <StatTile label="Activas" value={stats.active} tone="text-success-600 dark:text-success-400" />
              <StatTile label="Respuestas" value={stats.responses} tone="text-brand-600 dark:text-brand-400" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {lista.map((encuesta) => (
                <SurveyCard
                  key={encuesta.id}
                  encuesta={encuesta}
                  confirming={confirmId === encuesta.id}
                  deleting={deletingId === encuesta.id}
                  onDetails={() => handleViewDetails(encuesta.id)}
                  onAskDelete={() => setConfirmId(encuesta.id)}
                  onCancelDelete={() => setConfirmId(null)}
                  onConfirmDelete={() => executeDeleteSurvey(encuesta.id)}
                />
              ))}
            </div>
          </>
        ) : (
          !showError && (
            <EmptyState
              icon={FiInbox}
              title="No hay encuestas creadas"
              text="Crea tu primera encuesta para comenzar a recopilar respuestas."
              action={
                <button type="button" onClick={() => cambiarTab("create")} className={`${BTN_PRIMARY} mt-3`}>
                  <FiPlus size={16} />
                  Crear primera encuesta
                </button>
              }
            />
          )
        )}
      </div>
    );
  };

  const renderCrear = () => (
    <SurveyForm
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      onCancel={() => cambiarTab("list")}
      submitting={isSubmitting}
      submitLabel="Crear encuesta"
      submittingLabel="Creando..."
      SubmitIcon={FiSend}
      minFechaInicio={dayjs().format("YYYY-MM-DD")}
    />
  );

  const renderResultados = () => {
    if (loading) return <SkeletonCards />;

    const conRespuestas = lista.filter((e) => (e.responses || 0) > 0);
    const maximo = Math.max(1, ...conRespuestas.map((e) => e.responses || 0));

    if (lista.length === 0) {
      return (
        <EmptyState
          icon={FiBarChart2}
          title="No hay encuestas creadas"
          text="Crea tu primera encuesta para ver resultados."
        />
      );
    }

    if (conRespuestas.length === 0) {
      return (
        <EmptyState
          icon={FiBarChart2}
          title="No hay resultados disponibles"
          text="Las encuestas aún no tienen respuestas."
        />
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {conRespuestas.map((encuesta) => {
          const tipo = tipoDe(encuesta.type);
          const Icono = tipo.Icono;
          const total = encuesta.responses || 0;

          return (
            <button
              key={encuesta.id}
              type="button"
              onClick={() => toast.info("El detalle de resultados estará disponible próximamente.")}
              className={`${CARD} flex flex-col gap-3 text-left transition-colors hover:bg-surface-2 animate-fade-in`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tipo.tone}`}
                >
                  <Icono size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-semibold text-ink">{encuesta.title}</h3>
                  <p className="truncate text-sm text-muted">
                    {encuesta.descripcion || "Sin descripción"}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-sm text-muted">Respuestas</span>
                  <span className="text-xl font-bold tabular-nums text-ink">{total}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink/5">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
                    style={{ width: `${(total / maximo) * 100}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiClipboard size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Encuestas</h1>
          <p className="text-sm text-muted">Gestiona y crea nuevas encuestas</p>
        </div>
      </header>

      {/* Pestañas */}
      <nav
        role="tablist"
        aria-label="Secciones de encuestas"
        className="grid grid-cols-3 gap-1 rounded-2xl border border-line bg-surface p-1 shadow-card sm:inline-grid sm:self-start"
      >
        {TABS.map(({ id, label, Icono }) => {
          const activa = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => cambiarTab(id)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-md font-medium transition-colors ${
                activa
                  ? "bg-brand-600 text-white shadow-brand"
                  : "text-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <Icono size={16} />
              {label}
              {id === "list" && stats.total > 0 && (
                <span
                  className={`rounded-full px-1.5 text-xs font-semibold tabular-nums ${
                    activa ? "bg-white/20 text-white" : "bg-surface-2 text-muted"
                  }`}
                >
                  {stats.total}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {tab === "list" && renderLista()}
      {tab === "create" && renderCrear()}
      {tab === "results" && renderResultados()}
    </div>
  );
};

export { GestionarEncuestasPage };
export default GestionarEncuestasPage;