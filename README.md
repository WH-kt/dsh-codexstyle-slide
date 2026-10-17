# dsh-reasoning-glow

[![npm version](https://img.shields.io/npm/v/dsh-reasoning-glow.svg)](https://www.npmjs.com/package/dsh-reasoning-glow)
[![license](https://img.shields.io/npm/l/dsh-reasoning-glow.svg)](LICENSE)

把 DeepSeek Harness（DSH）输入框里的模型选择器，换成一条 **Codex 风格**的发光推理强度滑块。

A **Codex-style**, glowing reasoning-effort slider for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) composer: drag the pill, the effort changes, and the top level lights up with drifting motes.

![dsh-codexstyle-slide](https://raw.githubusercontent.com/WH-kt/dsh-codexstyle-slide/main/docs/screenshot.webp)

## Codex 风格 / Codex-style

这个面板参考了 Codex 系推理强度选择器的视觉语言：

- **档位名是主角**：居中的粗体档位名（如 `高` / `Max`），最高档用渐变字呈现
- **模型名是配角**：紧挨其下的小号灰字 + `›`，点开才是模型列表
- **一条粗胶囊轨道**：大号圆形白色拖钮，刻度点沿轨道排布，拖动即时预览
- **最高档才有的流光**：蓝紫渐变铺满轨道，细碎粒子缓慢上浮、明暗呼吸

和 DSH 的既有交互做了保留：拖动松手才写入会话、模型列表仍可从模型名进入、`↺` 一键回到服务商默认档位。

## 特性 / Features

- **胶囊轨道 + 圆形拖钮**：拖动、点击轨道、`←` `→` `↑` `↓` `Home` `End` 都能切换档位，松手才真正提交
- **最高档特效**：轨道切换为蓝紫渐变，18 颗白色粒子各自上浮、摆动、明暗呼吸
- **档位标题实时跟随**：拖动过程中标题立即切换到对应档位名
- **↺ 恢复默认**：一键回到该模型服务商提供的默认档位
- **模型列表仍在**：点模型名展开分组模型列表，换模型后自动带回当前档位
- 深浅色主题自动适配；中英文界面；`prefers-reduced-motion` 时粒子静止
- 单文件浏览器端代码，无构建步骤，无第三方依赖

## 安装 / Install

### 通过 npm

```sh
dsh plugin add dsh-reasoning-glow
# 若你的 CLI 要求显式 profile：dsh plugin --profile desktop add dsh-reasoning-glow
```

也可以在 DSH 的插件管理器里按包名搜索安装。

### 从源码

```sh
git clone https://github.com/WH-kt/dsh-codexstyle-slide.git
dsh plugin add ./dsh-codexstyle-slide
```

或者：DSH 桌面端 → 设置 → 插件 → 用插件管理器安装这个本地目录。

安装后插件作为 profile 层生效，**刷新页面**即可看到新的滑块。

## 兼容性 / Compatibility

- DSH `0.2.1-rc.2`（Web 与桌面端），Node.js `>=22`
- 通过 `conversation.input.model` 槽位（`priority: -1`）接管模型选择器
- 依赖 Client 服务：`slots`、`modelDirectories`、`sessions`、`locale`、`remote`、`remote.session`
- 模型目录通过槽位的 `inject(sessionId)` 获取，不做任何模型或认证上的假设

## 开发 / Development

```sh
npm test        # test/smoke.mjs：32 项运行时契约 + 渲染检查，不需要浏览器
```

```
.
├── client.js            # 浏览器端：UI、样式、槽位注册（无构建）
├── index.js             # Host 端空实现，让加载器看到这个插件
├── cordis.patch.yml     # bundle 层：把插件插入 profile
├── locale/{zh,en}.json  # 插件管理器中显示的标题/描述
├── icon.svg             # 插件图标
└── test/smoke.mjs       # 无浏览器冒烟测试
```

`test/smoke.mjs` 会用假的 `window.__ModuleLoader__`、React 和 Cordis 上下文加载真实
`client.js`，验证注入清单、槽位注册契约、`load/select` 通路、滑块提交、模型列表渲染
以及最高档的渐变/粒子分支。

## 许可 / License

[MIT](LICENSE)
