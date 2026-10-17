// Smoke test for the reasoning-glow client half: loads client.js with a fake
// browser module loader and a fake Cordis context, checks the slot registration
// contract against the built-in ui-model-selection shape, renders the
// registered component (function components, no effects), opens the popover,
// and drives the slider's commit path into the injected select().
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.resolve(here, "../client.js"), "utf8");

const logs = [];
let capturedFactory = null;

/* --- fake browser environment ------------------------------------------- */
globalThis.window = {
	__ModuleLoader__: {
		load(spec) {
			if (spec.id !== "dsh-reasoning-glow") throw new Error(`unexpected module id ${spec.id}`);
			capturedFactory = spec.factory;
		},
	},
};
globalThis.document = {
	querySelector: () => null,
	createElement: () => ({ dataset: {}, textContent: "", parentNode: null }),
	head: { appendChild() {} },
	body: {},
	addEventListener() {},
	removeEventListener() {},
};
globalThis.Node = class Node {};
globalThis.Element = class Element {};

/* --- fake React ---------------------------------------------------------- */
let stateIndex = 0;
let forceOpen = false;
let forcePane = false;
class Component {
	constructor(props) { this.props = props; this.state = {}; }
}
const React = {
	createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
	Component,
	useState(initial) {
		const index = stateIndex++;
		if (forceOpen && index === 2) return [true, () => {}]; // Seat's `open` slot
		if (forcePane && index === 3) return ["models", () => {}]; // Seat's `pane` slot
		return [typeof initial === "function" ? initial() : initial, () => {}];
	},
	useEffect: () => {},
	useLayoutEffect: () => {},
	useRef: (initial) => ({ current: initial }),
	useCallback: (fn) => fn,
	useMemo: (fn) => fn(),
	useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
};

function requireFor(name) {
	if (name === "react") return React;
	if (name === "react-dom") return { createPortal: (node) => node };
	throw new Error(`unexpected require(${name})`);
}

/* --- fake session/model services ----------------------------------------- */
let currentEffort = "high";
const baseGroups = [{
	id: "deepseek-account",
	name: "DeepSeek Account",
	models: [{
		id: "deepseek-flash",
		name: "DeepSeek-V4.1-Flash",
		reasoning: {
			defaultEffort: "high",
			efforts: [{ id: "low", name: "低" }, { id: "high", name: "高" }, { id: "max", name: "Max" }],
		},
	}, {
		id: "deepseek-v4-pro",
		name: "DeepSeek-V4.1-Pro",
		reasoning: {
			defaultEffort: "high",
			efforts: [{ id: "low", name: "低" }, { id: "high", name: "高" }, { id: "max", name: "Max" }],
		},
	}],
}];
const getSnapshot = () => ({
	status: "ready",
	groups: baseGroups,
	current: { provider: "deepseek-account", model: "deepseek-flash", reasoningEffort: currentEffort },
	retainedEffort: undefined,
	pending: null,
	error: null,
	failures: [],
});
const store = { subscribe: () => () => {}, getSnapshot };

let loadCalls = 0;
const selectCalls = [];
const directory = {
	store,
	load: async () => { loadCalls += 1; },
	select: async (selection) => { selectCalls.push(selection); return { ok: true }; },
};
const models = { directoryFor: (sessionId) => { logs.push(`directoryFor(${sessionId})`); return directory; } };
const sessions = { subagentAddress: () => undefined };
const locale = {
	register: (ns) => { logs.push(`locale.register(${ns})`); return () => {}; },
	getLocale: () => ({ id: "zh" }),
	subscribe: () => () => {},
};

let registration = null;
const slotsService = {
	inject(name, callback) { logs.push(`slots.inject(${name})`); return callback(); },
	register(options, component) { registration = { options, component }; logs.push("slots.register"); return () => {}; },
};
const scope = { slots: slotsService, modelDirectories: models, sessions, locale, effect(callback) { return callback(); } };
const ctx = {
	effect(callback) { return callback(); },
	inject(deps, callback) {
		logs.push(`ctx.inject(${deps.join(",")})`);
		for (const dep of deps) {
			if (dep === "remote" || dep === "remote.session") continue;
			if (!(dep in scope)) throw new Error(`unavailable service: ${dep}`);
		}
		return callback(scope);
	},
};

/* --- helpers ------------------------------------------------------------- */
const results = [];
const check = (label, condition) => results.push([condition ? "PASS" : "FAIL", label]);
const hasClass = (node, token) => node.classNames.some((name) => name.split(" ").includes(token));

function collect(element) {
	const texts = [];
	const classNames = [];
	let sliderProps = null;
	const rows = [];
	let depth = 0;
	const walk = (node) => {
		if (node === null || node === undefined || typeof node === "boolean") return;
		if (Array.isArray(node)) { node.forEach(walk); return; }
		if (typeof node === "string" || typeof node === "number") { texts.push(String(node)); return; }
		if (++depth > 800) throw new Error("render tree too deep");
		const { type, props, children } = node;
		if (props && typeof props.className === "string") classNames.push(props.className);
		if (props && Array.isArray(props.efforts) && typeof props.onCommit === "function") sliderProps = props;
		if (props && props.role === "menuitemradio" && typeof props.onClick === "function") rows.push(props);
		const kids = children.length > 0 ? children : props.children;
		if (typeof type === "function") {
			if (type.prototype instanceof Component) { walk(kids); return; }
			walk(type({ ...props, children: kids }));
			return;
		}
		if (typeof type === "string") { walk(kids); return; }
		walk(kids); // fragments / portals (fake React has no Fragment symbol)
	};
	walk(element);
	return { texts, classNames, sliderProps, rows };
}

/* --- run the client module ----------------------------------------------- */
new Function("require", source)(requireFor);
if (typeof capturedFactory !== "function") throw new Error("factory was not captured by the module loader");

const plugin = capturedFactory(requireFor);
check("plugin exposes apply", typeof plugin.apply === "function");
check("six injected services", JSON.stringify(plugin.inject) === JSON.stringify(["slots", "modelDirectories", "sessions", "locale", "remote", "remote.session"]));

plugin.apply(ctx);

check("slot registered", registration !== null);
check("slot name", registration?.options?.name === "conversation.input.model");
check("slot priority -1", registration?.options?.priority === -1);
check("slot locale namespace", registration?.options?.locale === "reasoning-glow");
check("registration inject is a function", typeof registration?.options?.inject === "function");

const injected = registration.options.inject("session-42");
check("inject carries sessionId", injected.sessionId === "session-42");
check("inject carries the directory store", injected.directory === store);
check("inject carries availability", injected.available === true);
check("inject carries load/select", typeof injected.load === "function" && typeof injected.select === "function");

injected.load();
check("load reaches the model directory", loadCalls === 1);

const initial = await injected.select({ provider: "deepseek-account", model: "deepseek-flash", reasoningEffort: "max" });
check("select reaches the model directory", selectCalls.length === 1 && selectCalls[0].reasoningEffort === "max" && initial.ok === true);

/* --- render closed (trigger only) ---------------------------------------- */
const props = {
	locked: false,
	available: injected.available,
	directory: injected.directory,
	load: injected.load,
	select: injected.select,
	sessionId: injected.sessionId,
	locale,
};
const closed = collect(registration.component(props));
check("trigger renders", closed.classNames.includes("rg-root") && closed.classNames.includes("rg-trigger"));
check("trigger shows the model name", closed.texts.join("|").includes("DeepSeek-V4.1-Flash"));
check("trigger shows the current effort", closed.texts.join("|").includes("高"));
check("popover stays closed", !closed.classNames.includes("rg-card"));

/* --- render open at the current level ------------------------------------ */
stateIndex = 0;
forceOpen = true;
const opened = collect(registration.component(props));
forceOpen = false;
check("popover renders", opened.classNames.includes("rg-card"));
check("slider renders", opened.classNames.includes("rg-track") && opened.classNames.includes("rg-thumb"));
check("card title shows the level", opened.texts.join("|").includes("高"));
check("non-max fill has no sparkles class", !hasClass(opened, "rg-fill-max"));

/* --- render open at the top level ---------------------------------------- */
currentEffort = "max";
stateIndex = 0;
forceOpen = true;
const top = collect(registration.component(props));
forceOpen = false;
check("top level title", top.texts.join("|").includes("Max"));
check("top level gradient fill", hasClass(top, "rg-fill-max"));
check("top level gradient title", hasClass(top, "rg-title-max"));
check("top level sparkles", top.classNames.filter((name) => name === "rg-spark").length === 18);
check("top level trigger glow", hasClass(top, "rg-effort-max"));

/* --- drive the slider commit --------------------------------------------- */
check("slider exposes onCommit", typeof top.sliderProps?.onCommit === "function");
selectCalls.length = 0;
top.sliderProps.onCommit(0);
await Promise.resolve();
check("commit sends the level through select()", selectCalls.length === 1 && selectCalls[0].reasoningEffort === "low" && selectCalls[0].provider === "deepseek-account" && selectCalls[0].model === "deepseek-flash");

/* --- render the model pane and switch models ----------------------------- */
stateIndex = 0;
forceOpen = true;
forcePane = true;
const listView = collect(registration.component(props));
forceOpen = false;
forcePane = false;
check("model list renders", listView.classNames.some((name) => name.split(" ").includes("rg-list")));
check("model list shows both models", listView.texts.join("|").includes("DeepSeek-V4.1-Flash") && listView.texts.join("|").includes("DeepSeek-V4.1-Pro"));
check("model rows are selectable", listView.rows.length === 2);
selectCalls.length = 0;
const proRow = listView.rows.find((row) => row.title === "DeepSeek-V4.1-Pro");
proRow.onClick();
await Promise.resolve();
check("picking a model calls select()", selectCalls.length === 1 && selectCalls[0].provider === "deepseek-account" && selectCalls[0].model === "deepseek-v4-pro");

for (const [status, label] of results) console.log(`${status}  ${label}`);
console.log("\ncalls:", logs.join(" -> "));
if (results.some(([status]) => status === "FAIL")) process.exit(1);
console.log("ALL PASS");
