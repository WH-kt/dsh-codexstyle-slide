/**
 * Reasoning-glow plugin, node half. Pure UI plugin: the empty apply keeps the
 * plugin visible in the host composition, while the browser half ships through
 * exports["./client"], discovered from the package.json `dsh.client` section.
 */

/** Host plugin body — no host-side behavior for this surface plugin. */
export function apply() {}
