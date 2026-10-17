window.__ModuleLoader__.load({
	id: "dsh-reasoning-glow",
	factory: (require) => {
		const React = require("react");
		let ReactDOM = null;
		try {
			ReactDOM = require("react-dom");
		} catch {
			ReactDOM = null;
		}
		const h = React.createElement;

		/** Locale namespace owned by this plugin. */
		const NS = "reasoning-glow";
		/** Slider track height; the thumb is a slightly larger circle so it reads as one. */
		const TRACK = 30;
		/** Slider thumb diameter. */
		const THUMB = 34;
		const HALF = THUMB / 2;

		/* ------------------------------------------------------------------ */
		/* Styles                                                              */
		/* ------------------------------------------------------------------ */
		const CSS = `
			.rg-root { position: relative; display: inline-flex; min-width: 0; }
			.rg-trigger { display: flex; align-items: center; gap: 4px; min-width: 0; max-width: 230px; height: 28px; padding: 0 4px 0 8px; border: none; border-radius: 999px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px; font-weight: 500; line-height: 20px; cursor: pointer; outline: none; }
			.rg-trigger:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-label-secondary) 12%, transparent); }
			.rg-trigger:focus-visible { box-shadow: 0 0 0 2px color-mix(in srgb, #3aa3ff 45%, transparent); }
			.rg-trigger:disabled { cursor: default; opacity: .55; }
			.rg-name { display: var(--dsh-composer-model-text-display, inline); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
			.rg-effort { flex: none; color: #3aa3ff; font-weight: 600; }
			.rg-effort-max { background: linear-gradient(96deg, #7FA6FF 0%, #A99BFF 55%, #C08CFF 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
			.rg-chev { flex: none; opacity: .7; transition: transform .16s ease; }
			.rg-chev-open { transform: rotate(180deg); }

			.rg-card { --rg-surface: color-mix(in srgb, var(--dsw-alias-bg-base) 82%, var(--dsw-alias-bg-overlay)); position: fixed; z-index: 60; box-sizing: border-box; width: min(264px, calc(100vw - 24px)); padding: 7px 10px 10px; border-radius: 16px; background: var(--rg-surface); border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent); box-shadow: 0 20px 44px rgba(0, 0, 0, .34), 0 2px 10px rgba(0, 0, 0, .18); color: var(--dsw-alias-label-primary); font-family: inherit; animation: rg-pop .14s ease-out both; }
			@keyframes rg-pop { from { opacity: 0; transform: translateY(4px) scale(.99); } to { opacity: 1; transform: none; } }

			.rg-head { position: relative; padding-top: 2px; }
			.rg-title { text-align: center; font-size: 15px; font-weight: 600; line-height: 20px; letter-spacing: .2px; color: #3aa3ff; }
			.rg-title-max { background: linear-gradient(96deg, #8AA9FF 0%, #A99BFF 45%, #C48CFF 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
			.rg-title-muted { color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 500; }
			.rg-reset { position: absolute; top: -3px; right: -4px; display: grid; place-items: center; width: 22px; height: 22px; padding: 0; border: none; border-radius: 50%; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }
			.rg-reset:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-label-secondary) 14%, transparent); color: var(--dsw-alias-label-primary); }
			.rg-reset:disabled { opacity: .35; cursor: default; }
			.rg-model { display: flex; align-items: center; justify-content: center; gap: 1px; max-width: 100%; margin: 0 auto 9px; padding: 2px 6px; border: none; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 11px; line-height: 16px; cursor: pointer; }
			.rg-model:hover { color: var(--dsw-alias-label-primary); background: color-mix(in srgb, var(--dsw-alias-label-secondary) 10%, transparent); }
			.rg-modelName { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
			.rg-modelChev { flex: none; opacity: .8; }

			.rg-track { position: relative; height: ${TRACK}px; border-radius: ${TRACK / 2}px; touch-action: none; cursor: grab; outline: none; }
			.rg-track-drag { cursor: grabbing; }
			.rg-track-disabled { opacity: .55; cursor: default; }
			.rg-rail { position: absolute; inset: 0; border-radius: ${TRACK / 2}px; background: color-mix(in srgb, var(--dsw-alias-label-secondary) 20%, transparent); }
			.rg-fill { position: absolute; left: 0; top: 0; bottom: 0; overflow: hidden; border-radius: ${TRACK / 2}px; background: linear-gradient(94deg, #2E8BFF 0%, #3FA5FF 100%); transition: width .2s cubic-bezier(.22, .9, .25, 1); }
			.rg-fill-max { background: linear-gradient(94deg, #7CA4FF 0%, #93A2FF 12%, #A2A6FF 24%, #ABA8FF 34%, #B2A3FE 45%, #AF99FE 56%, #9766E4 68%, #8A5AD8 78%, #714DC7 90%, #6752C9 100%); }
			.rg-glow { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255, 255, 255, .16), rgba(255, 255, 255, 0) 62%); pointer-events: none; }
			.rg-sparks { position: absolute; inset: 0; opacity: 0; transition: opacity .3s ease; pointer-events: none; }
			.rg-fill-max .rg-sparks { opacity: 1; }
			.rg-spark { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, .95); box-shadow: 0 0 5px rgba(255, 255, 255, .6); opacity: 0; animation: rg-float 4.6s ease-in-out infinite; }
			@keyframes rg-float {
				0% { opacity: 0; transform: translate3d(0, 4px, 0) scale(.55); }
				15% { opacity: .95; }
				50% { opacity: .45; transform: translate3d(1.6px, -3px, 0) scale(1.06); }
				78% { opacity: .9; }
				100% { opacity: 0; transform: translate3d(-1.2px, -6px, 0) scale(.7); }
			}
			.rg-tick { position: absolute; top: calc(50% - 1.5px); width: 3px; height: 3px; margin-left: -1.5px; border-radius: 50%; background: color-mix(in srgb, var(--dsw-alias-label-secondary) 55%, transparent); transition: background .18s ease; }
			.rg-tick-on { background: rgba(214, 236, 255, .88); }
			.rg-thumb { position: absolute; top: ${(TRACK - THUMB) / 2}px; width: ${THUMB}px; height: ${THUMB}px; margin-left: -${HALF}px; border: none; border-radius: 50%; background: radial-gradient(circle closest-side, #ffffff 0 97%, rgba(255, 255, 255, 0) 100%); filter: drop-shadow(0 1px 1.5px rgba(10, 20, 40, .25)) drop-shadow(0 4px 10px rgba(10, 20, 40, .18)); transition: left .2s cubic-bezier(.22, .9, .25, 1), transform .12s ease, filter .12s ease; }
			.rg-thumb-drag { transform: scale(1.05); filter: drop-shadow(0 2px 3px rgba(10, 20, 40, .28)) drop-shadow(0 8px 18px rgba(10, 20, 40, .24)); }
			.rg-track-drag .rg-fill, .rg-track-drag .rg-thumb { transition: none; }
			.rg-track:focus-visible .rg-thumb { filter: drop-shadow(0 0 2px rgba(58, 163, 255, .7)) drop-shadow(0 0 7px rgba(58, 163, 255, .45)) drop-shadow(0 4px 10px rgba(10, 20, 40, .18)); }

			.rg-hint { margin: 4px 0 2px; text-align: center; font-size: 11.5px; line-height: 16px; color: var(--dsw-alias-label-secondary); }
			.rg-error { margin-top: 8px; padding: 5px 7px; border-radius: 8px; font-size: 11px; line-height: 15px; color: var(--dsw-alias-state-error-primary); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent); }

			.rg-paneHead { display: flex; align-items: center; gap: 4px; padding: 0 0 4px; }
			.rg-back { display: grid; place-items: center; width: 22px; height: 22px; padding: 0; border: none; border-radius: 50%; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }
			.rg-back:hover { background: color-mix(in srgb, var(--dsw-alias-label-secondary) 14%, transparent); color: var(--dsw-alias-label-primary); }
			.rg-paneTitle { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-primary); }
			.rg-list { max-height: 190px; overflow-y: auto; margin: 0 -6px; padding: 0 6px 2px; }
			.rg-groupTitle { position: sticky; top: 0; z-index: 1; padding: 6px 4px 4px; background: var(--rg-surface, var(--dsw-alias-bg-overlay)); font-size: 10.5px; line-height: 14px; color: var(--dsw-alias-label-secondary); }
			.rg-group + .rg-group { margin-top: 2px; }
			.rg-row { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 29px; padding: 3px 7px; border: none; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; line-height: 18px; text-align: left; cursor: pointer; }
			.rg-row:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-label-secondary) 10%, transparent); }
			.rg-row:disabled { cursor: default; opacity: .6; }
			.rg-rowName { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
			.rg-check { flex: none; color: #3aa3ff; }
			.rg-status { padding: 9px 6px 5px; font-size: 11.5px; line-height: 16px; color: var(--dsw-alias-label-secondary); }

			@media (prefers-reduced-motion: reduce) {
				.rg-card { animation: none; }
				.rg-fill, .rg-thumb, .rg-chev, .rg-sparks, .rg-tick { transition: none; }
				.rg-spark { animation: none; opacity: .85; }
			}
		`;

		/* ------------------------------------------------------------------ */
		/* Dictionaries                                                        */
		/* ------------------------------------------------------------------ */
		const zh = {
			"trigger.fallback": "选择模型",
			"trigger.loading": "正在加载模型…",
			"trigger.aria": "选择模型与推理强度，当前 {model} · {effort}",
			"trigger.ariaModel": "选择模型与推理强度，当前 {model}",
			"card.aria": "推理强度",
			"effort.title": "推理强度",
			"effort.default": "默认",
			"effort.reset": "恢复默认档位",
			"effort.none": "当前模型未提供推理等级",
			"effort.single": "当前模型仅支持 {name}",
			"models.title": "模型",
			"models.back": "返回",
			"models.loading": "正在刷新模型列表…",
			"models.empty": "暂无可用模型",
			"models.retry": "重试加载模型",
			"provider.account": "DeepSeek 账号",
			"error.generic": "切换失败，请重试",
			"error.action": "切换失败：{message}"
		};
		const en = {
			"trigger.fallback": "Select model",
			"trigger.loading": "Loading models…",
			"trigger.aria": "Select model and reasoning effort, currently {model} · {effort}",
			"trigger.ariaModel": "Select model and reasoning effort, currently {model}",
			"card.aria": "Reasoning effort",
			"effort.title": "Reasoning effort",
			"effort.default": "Default",
			"effort.reset": "Reset to the default level",
			"effort.none": "This model provides no reasoning levels",
			"effort.single": "This model only supports {name}",
			"models.title": "Model",
			"models.back": "Back",
			"models.loading": "Refreshing models…",
			"models.empty": "No models available",
			"models.retry": "Retry loading models",
			"provider.account": "DeepSeek Account",
			"error.generic": "Could not switch, try again",
			"error.action": "Could not switch: {message}"
		};

		function interpolate(template, vars) {
			if (vars === undefined) return template;
			return String(template).replace(/\{(\w+)\}/g, (match, key) => vars[key] === undefined ? match : String(vars[key]));
		}

		function useT(locale, provided) {
			const read = () => {
				try {
					const snapshot = locale && typeof locale.getLocale === "function" ? locale.getLocale() : null;
					return snapshot && typeof snapshot.id === "string" ? snapshot.id : "zh";
				} catch {
					return "zh";
				}
			};
			const [localeId, setLocaleId] = React.useState(read);
			React.useEffect(() => {
				if (!locale || typeof locale.subscribe !== "function") return;
				const update = () => setLocaleId(read());
				const dispose = locale.subscribe(update);
				return typeof dispose === "function" ? dispose : undefined;
			}, [locale]);
			const dict = String(localeId).toLowerCase().startsWith("en") ? en : zh;
			const fallback = React.useCallback((key, vars) => interpolate(dict[key] !== undefined ? dict[key] : key, vars), [dict]);
			return typeof provided === "function" ? provided : fallback;
		}

		/* ------------------------------------------------------------------ */
		/* Icons (inline, original paths)                                      */
		/* ------------------------------------------------------------------ */
		const svg = (children, size) => h("svg", {
			viewBox: "0 0 24 24",
			width: size || 16,
			height: size || 16,
			fill: "none",
			stroke: "currentColor",
			strokeWidth: 2,
			strokeLinecap: "round",
			strokeLinejoin: "round",
			"aria-hidden": "true",
			focusable: "false"
		}, children);
		const chevronDown = svg(h("path", { d: "M6 9l6 6 6-6" }), 14);
		const chevronRight = svg(h("path", { d: "M9 6l6 6-6 6" }), 13);
		const chevronLeft = svg(h("path", { d: "M15 6l-6 6 6 6" }), 15);
		const resetIcon = svg([
			h("path", { d: "M4.6 9.2A8 8 0 1 1 4 14.2", key: "a" }),
			h("path", { d: "M4.2 4.4v5h5", key: "b" })
		], 15);
		const checkIcon = svg(h("path", { d: "M20 6L9 17l-5-5" }), 15);

		/* ------------------------------------------------------------------ */
		/* Decorative sparks for the top level                                 */
		/* ------------------------------------------------------------------ */
		const SPARKS = [
			[5, 32, 2.4, .20, 4.8], [9, 62, 1.8, .70, 5.6], [14, 34, 2.8, .45, 4.2],
			[19, 70, 1.6, .90, 5.9], [24, 44, 2.2, .10, 5.2], [29, 76, 2.6, .60, 4.6],
			[34, 33, 1.8, .35, 6.1], [39, 58, 2.4, .80, 4.4], [44, 38, 1.6, .05, 5.4],
			[50, 68, 2.8, .55, 4.9], [55, 34, 1.8, .95, 5.8], [60, 52, 2.2, .30, 4.3],
			[65, 74, 1.6, .70, 6.2], [70, 36, 2.6, .15, 5.1], [75, 60, 1.8, .50, 4.7],
			[81, 34, 2.2, .85, 5.5], [86, 66, 2.6, .40, 4.1], [92, 42, 1.8, .60, 5.0]
		].map((entry) => ({
			left: entry[0] + "%",
			top: entry[1] + "%",
			size: entry[2],
			delay: -(entry[3] * entry[4]).toFixed(2),
			duration: entry[4]
		}));

		const trackPos = (ratio) => "calc((100% - " + THUMB + "px) * " + ratio + " + " + HALF + "px)";

		/* ------------------------------------------------------------------ */
		/* Slider                                                              */
		/* ------------------------------------------------------------------ */
		function EffortSlider(props) {
			const trackRef = React.useRef(null);
			const draggingRef = React.useRef(false);
			const [dragging, setDragging] = React.useState(false);
			const efforts = props.efforts;
			const last = Math.max(0, efforts.length - 1);
			const shown = Math.max(0, Math.min(last, Math.round(props.value)));
			const ratio = last === 0 ? 0 : Math.max(0, Math.min(1, props.value / last));
			const atMax = props.value >= last - 0.0001;

			const positionOf = (clientX) => {
				const el = trackRef.current;
				if (el === null || last === 0) return 0;
				const rect = el.getBoundingClientRect();
				const travel = rect.width - THUMB;
				if (travel <= 0) return 0;
				return Math.max(0, Math.min(last, ((clientX - rect.left - HALF) / travel) * last));
			};
			const clamp = (position) => Math.max(0, Math.min(last, position));
			const snap = (position) => Math.max(0, Math.min(last, Math.round(position)));
			const magnetize = (position) => {
				const nearest = snap(position);
				return Math.abs(position - nearest) <= 0.12 ? nearest : clamp(position);
			};
			const release = (event) => {
				if (!draggingRef.current) return;
				draggingRef.current = false;
				setDragging(false);
				const target = clamp(positionOf(event.clientX));
				props.onPreview(target);
				props.onCommit(snap(target));
			};
			const down = (event) => {
				if (props.disabled) return;
				if (typeof event.button === "number" && event.button !== 0) return;
				event.preventDefault();
				draggingRef.current = true;
				setDragging(true);
				if (typeof event.currentTarget.setPointerCapture === "function") {
					try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* pointer capture is best-effort */ }
				}
				props.onPreview(magnetize(positionOf(event.clientX)));
			};
			const move = (event) => {
				if (!draggingRef.current) return;
				props.onPreview(magnetize(positionOf(event.clientX)));
			};
			const key = (event) => {
				if (props.disabled) return;
				let next = null;
				if (event.key === "ArrowRight" || event.key === "ArrowUp") next = Math.min(last, shown + 1);
				else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = Math.max(0, shown - 1);
				else if (event.key === "Home") next = 0;
				else if (event.key === "End") next = last;
				if (next === null || next === shown) return;
				event.preventDefault();
				props.onPreview(next);
				props.onCommit(next);
			};

			return h("div", {
				ref: trackRef,
				className: "rg-track" + (dragging ? " rg-track-drag" : "") + (props.disabled ? " rg-track-disabled" : ""),
				role: "slider",
				tabIndex: props.disabled ? -1 : 0,
				"aria-label": props.label,
				"aria-valuemin": 0,
				"aria-valuemax": last,
				"aria-valuenow": shown,
				"aria-valuetext": efforts[shown] ? efforts[shown].name : undefined,
				"aria-disabled": props.disabled ? true : undefined,
				onPointerDown: down,
				onPointerMove: move,
				onPointerUp: release,
				onPointerCancel: release,
				onKeyDown: key
			},
				h("div", { className: "rg-rail" }),
				h("div", {
					className: "rg-fill" + (atMax ? " rg-fill-max" : ""),
					style: { width: trackPos(ratio) }
				},
					h("div", { className: "rg-glow" }),
					h("div", { className: "rg-sparks" }, SPARKS.map((spark, index) => h("span", {
						key: index,
						className: "rg-spark",
						style: {
							left: spark.left,
							top: spark.top,
							width: spark.size + "px",
							height: spark.size + "px",
							animationDelay: spark.delay + "s",
							animationDuration: spark.duration + "s"
						}
					})))),
				efforts.map((effort, index) => h("span", {
					key: effort.id,
					className: "rg-tick" + (index <= shown ? " rg-tick-on" : ""),
					style: { left: trackPos(last === 0 ? 0 : index / last) }
				})),
				h("div", {
					className: "rg-thumb" + (dragging ? " rg-thumb-drag" : ""),
					style: { left: trackPos(ratio) }
				})
			);
		}

		/* ------------------------------------------------------------------ */
		/* Error boundary: never blank the composer permanently                */
		/* ------------------------------------------------------------------ */
		class Boundary extends React.Component {
			constructor(props) {
				super(props);
				this.state = { failed: false };
			}
			static getDerivedStateFromError() {
				return { failed: true };
			}
			componentDidCatch(error) {
				if (typeof console !== "undefined" && typeof console.error === "function") console.error("reasoning-glow: model control failed to render", error);
			}
			render() {
				return this.state.failed ? null : this.props.children;
			}
		}

		/* ------------------------------------------------------------------ */
		/* Seat                                                                */
		/* ------------------------------------------------------------------ */
		const EMPTY_STATE = Object.freeze({
			status: "loading",
			groups: [],
			current: null,
			retainedEffort: undefined,
			pending: null,
			error: null,
			failures: []
		});

		function Seat(props) {
			const t = useT(props.locale, props.t);
			const sessionId = props.sessionId;
			const available = props.available !== false;
			const locked = props.locked === true;
			const store = props.directory && typeof props.directory.subscribe === "function" ? props.directory : null;
			const load = typeof props.load === "function" ? props.load : null;
			const select = typeof props.select === "function" ? props.select : null;

			const subscribe = React.useCallback((callback) => store === null ? () => {} : store.subscribe(callback), [store]);
			const getSnapshot = React.useCallback(() => store === null ? EMPTY_STATE : store.getSnapshot() || EMPTY_STATE, [store]);
			const state = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

			const initialized = React.useRef(null);
			React.useEffect(() => {
				if (!available || load === null) return;
				if (initialized.current === sessionId) return;
				initialized.current = sessionId;
				load();
			}, [available, load, sessionId]);

			const groups = Array.isArray(state.groups) ? state.groups : [];
			const current = state.current || null;
			let currentChoice = null;
			if (current !== null) {
				for (const group of groups) {
					for (const model of group.models) {
						if (group.id === current.provider && model.id === current.model) currentChoice = { group, model };
					}
				}
			}
			const reasoning = currentChoice ? currentChoice.model.reasoning : undefined;
			const efforts = reasoning && Array.isArray(reasoning.efforts) ? reasoning.efforts : [];
			const defaultEffort = reasoning ? reasoning.defaultEffort : undefined;
			const effectiveEffort = current !== null && current.reasoningEffort !== undefined ? current.reasoningEffort : defaultEffort;
			const foundIndex = efforts.findIndex((level) => level.id === effectiveEffort);
			const baseIndex = foundIndex >= 0 ? foundIndex : (efforts.length > 0 ? Math.floor(efforts.length / 2) : 0);
			const busy = locked || state.pending !== null && state.pending !== undefined || state.status === "selecting";

			const [preview, setPreview] = React.useState(null);
			const [open, setOpen] = React.useState(false);
			const [pane, setPane] = React.useState("root");
			const [error, setError] = React.useState(null);
			const [position, setPosition] = React.useState(null);
			const rootRef = React.useRef(null);
			const triggerRef = React.useRef(null);
			const menuRef = React.useRef(null);

			React.useEffect(() => {
				setPreview(null);
			}, [sessionId, foundIndex, efforts.length]);

			React.useEffect(() => {
				if (error === null) return;
				const timer = setTimeout(() => setError(null), 6000);
				return () => clearTimeout(timer);
			}, [error]);

			React.useEffect(() => {
				if (!open) return;
				const onPointer = (event) => {
					const target = event.target;
					if (!(target instanceof Node)) return;
					if (rootRef.current && rootRef.current.contains(target)) return;
					if (menuRef.current && menuRef.current.contains(target)) return;
					setOpen(false);
					setPane("root");
				};
				const onKey = (event) => {
					if (event.key !== "Escape") return;
					setOpen(false);
					setPane("root");
					if (triggerRef.current) triggerRef.current.focus();
				};
				document.addEventListener("mousedown", onPointer, true);
				document.addEventListener("keydown", onKey, true);
				return () => {
					document.removeEventListener("mousedown", onPointer, true);
					document.removeEventListener("keydown", onKey, true);
				};
			}, [open]);

			React.useLayoutEffect(() => {
				if (!open) {
					setPosition(null);
					return;
				}
				const place = () => {
					const trigger = triggerRef.current;
					if (trigger === null) return;
					const rect = trigger.getBoundingClientRect();
					const card = menuRef.current;
					const width = card ? card.offsetWidth : 264;
					const height = card ? card.offsetHeight : 170;
					const margin = 12;
					const left = Math.min(Math.max(rect.left, margin), Math.max(margin, window.innerWidth - width - margin));
					let top = rect.top - 10 - height;
					if (top < margin) top = Math.min(window.innerHeight - height - margin, rect.bottom + 10);
					setPosition({ left: Math.round(left), top: Math.round(Math.max(margin, top)) });
				};
				place();
				window.addEventListener("resize", place);
				window.addEventListener("scroll", place, true);
				let observer = null;
				if (typeof ResizeObserver !== "undefined" && menuRef.current !== null) {
					observer = new ResizeObserver(place);
					observer.observe(menuRef.current);
				}
				return () => {
					window.removeEventListener("resize", place);
					window.removeEventListener("scroll", place, true);
					if (observer !== null) observer.disconnect();
				};
			}, [open, pane]);

			if (!available) return null;

			const value = preview === null ? baseIndex : preview;
			const shown = Math.max(0, Math.min(efforts.length - 1, Math.round(value)));
			const atMax = efforts.length > 1 && value >= efforts.length - 1 - 0.0001;

			const reportError = (cause) => {
				let message = "";
				if (typeof cause === "string") message = cause;
				else if (cause && typeof cause === "object") {
					if (cause.error && typeof cause.error.message === "string") message = cause.error.message;
					else if (typeof cause.message === "string") message = cause.message;
				}
				setPreview(null);
				setError(message ? t("error.action", { message }) : t("error.generic"));
			};

			const submit = (selection) => {
				if (select === null) return;
				let result;
				try {
					result = select(selection);
				} catch (cause) {
					reportError(cause);
					return;
				}
				Promise.resolve(result).then((value) => {
					if (value && value.ok === false) reportError(value.error);
				}).catch(reportError);
			};

			const effortName = (effortId) => {
				const level = efforts.find((item) => item.id === effortId);
				return level ? level.name : undefined;
			};
			const effortLabel = reasoning === undefined
				? undefined
				: effectiveEffort === undefined
					? t("effort.default")
					: effortName(effectiveEffort) || t("effort.default");
			const modelName = currentChoice ? currentChoice.model.name : (state.status === "loading" ? t("trigger.loading") : t("trigger.fallback"));

			const labelFor = (provider, model, placement, selected) => {
				const renderSlot = props.renderSlot;
				if (typeof renderSlot !== "function") return model.name;
				try {
					const rendered = renderSlot("conversation.input.model.label", { provider, model, placement, selected }, { fallback: model.name });
					return rendered === undefined || rendered === null ? model.name : rendered;
				} catch {
					return model.name;
				}
			};

			const chooseEffort = (index) => {
				if (current === null || busy) return;
				const level = efforts[Math.round(index)];
				if (!level) return;
				if (level.id === effectiveEffort) {
					setPreview(null);
					return;
				}
				setPreview(Math.round(index));
				const selection = { provider: current.provider, model: current.model, reasoningEffort: level.id };
				submit(selection);
			};

			const canReset = current !== null && reasoning !== undefined && current.reasoningEffort !== undefined && current.reasoningEffort !== defaultEffort;
			const resetEffort = () => {
				if (!canReset || busy) return;
				setPreview(null);
				const selection = { provider: current.provider, model: current.model };
				if (defaultEffort !== undefined) selection.reasoningEffort = defaultEffort;
				submit(selection);
			};

			const chooseModel = (group, model) => {
				if (current !== null && current.provider === group.id && current.model === model.id) {
					setPane("root");
					return;
				}
				const targetReasoning = model.reasoning;
				const targetEfforts = targetReasoning && Array.isArray(targetReasoning.efforts) ? targetReasoning.efforts : [];
				let effort;
				if (current !== null && current.reasoningEffort !== undefined && targetEfforts.some((level) => level.id === current.reasoningEffort)) effort = current.reasoningEffort;
				else if (targetReasoning && targetReasoning.defaultEffort !== undefined) effort = targetReasoning.defaultEffort;
				else if (targetEfforts.length > 0) effort = targetEfforts[Math.floor(targetEfforts.length / 2)].id;
				const selection = { provider: group.id, model: model.id };
				if (effort !== undefined) selection.reasoningEffort = effort;
				setPreview(null);
				setPane("root");
				submit(selection);
			};

			const triggerAria = effortLabel === undefined
				? t("trigger.ariaModel", { model: modelName })
				: t("trigger.aria", { model: modelName, effort: effortLabel });

			const providerOf = (group) => ({ id: group.id, name: group.id === "deepseek-account" ? t("provider.account") : group.name });

			const slider = efforts.length > 1
				? h(EffortSlider, {
					efforts,
					value,
					disabled: busy,
					label: t("effort.title"),
					onPreview: (index) => setPreview(index),
					onCommit: (index) => chooseEffort(index)
				})
				: h("div", { className: "rg-hint" }, efforts.length === 1
					? t("effort.single", { name: efforts[0].name })
					: t("effort.none"));

			const loadError = state.error || (Array.isArray(state.failures) && state.failures.length > 0
				? state.failures.map((failure) => failure.error?.message || failure.message || String(failure.provider || failure.id || "")).join("; ")
				: null);
			const errorMessage = error || loadError;
			const errorEl = errorMessage === null ? null : h("div", { className: "rg-error", role: "alert" },
				errorMessage,
				loadError ? h("button", {
					type: "button", className: "rg-row",
					onClick: () => { if (load !== null) load(); }
				}, t("models.retry")) : null);
			/** The title follows the dragged position, not only the committed level. */
			const titleLabel = reasoning === undefined
				? t("effort.title")
				: efforts.length > 0 && efforts[shown] !== undefined ? efforts[shown].name : effortLabel;

			const rootPane = h(React.Fragment, null,
				h("div", { className: "rg-head" },
					h("button", {
						type: "button",
						className: "rg-reset",
						title: t("effort.reset"),
						"aria-label": t("effort.reset"),
						disabled: !canReset || busy,
						onClick: resetEffort
					}, resetIcon),
					h("div", {
						className: "rg-title" + (reasoning === undefined ? " rg-title-muted" : atMax ? " rg-title-max" : ""),
						"aria-live": "polite"
					}, titleLabel),
					h("button", {
						type: "button",
						className: "rg-model",
						title: modelName,
						onClick: () => setPane("models")
					},
						h("span", { className: "rg-modelName" }, currentChoice ? labelFor(providerOf(currentChoice.group), currentChoice.model, "menu", true) : modelName),
						h("span", { className: "rg-modelChev" }, chevronRight))
				),
				slider,
				errorEl
			);

			const modelRows = groups.map((group) => h("div", { className: "rg-group", key: group.id },
				h("div", { className: "rg-groupTitle" }, providerOf(group).name),
				group.models.map((model) => {
					const selected = current !== null && current.provider === group.id && current.model === model.id;
					return h("button", {
						key: model.id,
						type: "button",
						role: "menuitemradio",
						"aria-checked": selected,
						className: "rg-row",
						title: model.name,
						disabled: busy,
						onClick: () => chooseModel(group, model)
					},
						h("span", { className: "rg-rowName" }, labelFor(providerOf(group), model, "option", selected)),
						selected ? h("span", { className: "rg-check" }, checkIcon) : null);
				})
			));

			const listStatus = state.status === "loading" && groups.length === 0
				? h("div", { className: "rg-status" }, t("models.loading"))
				: groups.length === 0
					? h("div", { className: "rg-status" }, t("models.empty"))
					: null;

			const modelsPane = h(React.Fragment, null,
				h("div", { className: "rg-paneHead" },
					h("button", {
						type: "button",
						className: "rg-back",
						title: t("models.back"),
						"aria-label": t("models.back"),
						onClick: () => setPane("root")
					}, chevronLeft),
					h("span", { className: "rg-paneTitle" }, t("models.title"))
				),
				h("div", { className: "rg-list" }, modelRows, listStatus),
				errorEl
			);

			const card = open ? h("div", {
				ref: menuRef,
				className: "rg-card",
				role: "dialog",
				"aria-label": t("card.aria"),
				style: position === null
					? { left: 0, top: 0, visibility: "hidden" }
					: { left: position.left + "px", top: position.top + "px" },
				onMouseDown: (event) => {
					if (event.target instanceof Element && event.target.closest("button") !== null) event.preventDefault();
				}
			}, pane === "models" ? modelsPane : rootPane) : null;

			const portaled = card !== null && typeof document !== "undefined" && ReactDOM !== null && typeof ReactDOM.createPortal === "function"
				? ReactDOM.createPortal(card, document.body)
				: card;

			return h("div", { ref: rootRef, className: "rg-root" },
				h("button", {
					ref: triggerRef,
					type: "button",
					className: "rg-trigger",
					"aria-haspopup": "dialog",
					"aria-expanded": open,
					"aria-label": triggerAria,
					title: effortLabel === undefined ? modelName : modelName + " · " + effortLabel,
					disabled: locked,
					onClick: () => {
						if (open) {
							setOpen(false);
							setPane("root");
							return;
						}
						setPane("root");
						setPreview(null);
						setError(null);
						setOpen(true);
						if (load !== null) load();
					}
				},
					h("span", { className: "rg-name" }, currentChoice ? labelFor(providerOf(currentChoice.group), currentChoice.model, "trigger", true) : modelName),
					effortLabel === undefined ? null : h("span", { className: "rg-effort" + (atMax ? " rg-effort-max" : "") }, effortLabel),
					h("span", { className: "rg-chev" + (open ? " rg-chev-open" : "") }, chevronDown)
				),
				portaled
			);
		}

		/* ------------------------------------------------------------------ */
		/* Registration                                                        */
		/* ------------------------------------------------------------------ */
		function insertStyles(ctx) {
			if (typeof document === "undefined") return;
			const run = () => {
				const existing = document.querySelector('style[data-plugin-css="' + NS + '"]');
				if (existing !== null) {
					existing.textContent = CSS;
					return undefined;
				}
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-reasoning-glow";
				tag.dataset.pluginCss = NS;
				tag.textContent = CSS;
				document.head.appendChild(tag);
				return () => {
					if (tag.parentNode !== null) tag.parentNode.removeChild(tag);
				};
			};
			if (typeof ctx.effect === "function") ctx.effect(run, "reasoning-glow: stylesheet");
			else run();
		}

		/**
		 * Services required by this Client plugin. `remote` and `remote.session`
		 * back the slot's standard props (session and access hooks); omitting them
		 * crashes the `conversation.input.model` occupant during render.
		 */
		const INJECT = ["slots", "modelDirectories", "sessions", "locale", "remote", "remote.session"];

		function apply(ctx) {
			ctx.inject(INJECT, mount);
		}

		function mount(ctx) {
			const slots = ctx.slots;
			const models = ctx.modelDirectories;
			const sessions = ctx.sessions;
			const locale = ctx.locale;

			insertStyles(ctx);
			ctx.effect(() => locale.register(NS, { zh, en }), "reasoning-glow: dictionaries");

			slots.inject("conversation.input.model", () => slots.register({
				name: "conversation.input.model",
				priority: -1,
				locale: NS,
				inject: (sessionId) => {
					const directory = models.directoryFor(sessionId);
					const available = sessions.subagentAddress(sessionId) === undefined;
					return {
						sessionId,
						available,
						directory: directory.store,
						load: () => {
							if (available) directory.load().catch(() => {});
						},
						select: (selection) => available ? directory.select(selection) : Promise.resolve(undefined)
					};
				}
			}, (props) => h(Boundary, { key: props.sessionId }, h(Seat, Object.assign({}, props, { locale })))));
		}

		return { inject: INJECT, apply };
	}
});
