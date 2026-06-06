<div align="center">

<img src="docs/assets/logo.png" alt="Viprasol Tech" width="120" />

# react-chat-ui

**Composable chat UI kit (message list, bubbles, input) for React.**

Built and maintained by Viprasol Tech

[![CI](https://github.com/Viprasol-Tech/react-chat-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/Viprasol-Tech/react-chat-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/react-chat-ui.svg)](https://www.npmjs.com/package/react-chat-ui)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](https://www.typescriptlang.org/)

</div>

---

## Features

- **Composable** — drop in the full `<ChatWindow>`, or assemble `<MessageList>`, `<MessageBubble>` and `<ChatInput>` yourself.
- **Author grouping** — consecutive messages from the same author collapse into a single run with one name header (`groupByAuthor`).
- **Role-aware styling** — `user`, `assistant` and `system` messages each get a `data-role` attribute and `rcui-bubble--<role>` class for easy theming.
- **Keyboard-native composer** — Enter sends, Shift+Enter inserts a newline, blank submissions are ignored.
- **Accessible** — the message log uses `role="log"` with `aria-live="polite"`; the composer is labelled.
- **Unstyled by default** — minimal inline layout only; bring your own CSS via stable class names.
- **TypeScript strict**, zero runtime dependencies, ships full `.d.ts` types.

## Install

```bash
npm i react-chat-ui
```

`react` and `react-dom` (>=18) are peer dependencies.

## Usage

```tsx
import { useState } from "react";
import { ChatWindow, type ChatMessage } from "react-chat-ui";

export function Support() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", role: "assistant", content: "Hi! How can I help?", timestamp: Date.now() },
  ]);

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text, timestamp: Date.now(), author: "You" },
    ]);
  };

  return (
    <div style={{ height: 480 }}>
      <ChatWindow
        messages={messages}
        onSend={handleSend}
        header={<strong>Support chat</strong>}
        emptyState={<p>No messages yet.</p>}
      />
    </div>
  );
}
```

Prefer to compose the pieces yourself:

```tsx
import { MessageList, ChatInput } from "react-chat-ui";

<MessageList messages={messages} showTimestamps />
<ChatInput onSend={handleSend} placeholder="Reply..." />
```

## API

### `<ChatWindow>`

| Prop             | Type                       | Default              | Description                                |
| ---------------- | -------------------------- | -------------------- | ------------------------------------------ |
| `messages`       | `ChatMessage[]`            | —                    | Messages in chronological order.           |
| `onSend`         | `(text: string) => void`   | —                    | Fired with trimmed text on submit.         |
| `header`         | `ReactNode`                | —                    | Optional node above the message list.      |
| `placeholder`    | `string`                   | `"Type a message..."`| Composer placeholder.                      |
| `disabled`       | `boolean`                  | `false`              | Disables the composer.                     |
| `showTimestamps` | `boolean`                  | `true`               | Toggle per-bubble timestamps.              |
| `emptyState`     | `ReactNode`                | —                    | Shown when there are no messages.          |
| `className`      | `string`                   | —                    | Extra class names on the root.             |

### `<MessageList>`

| Prop             | Type            | Default | Description                          |
| ---------------- | --------------- | ------- | ------------------------------------ |
| `messages`       | `ChatMessage[]` | —       | Messages in chronological order.     |
| `showTimestamps` | `boolean`       | `true`  | Toggle per-bubble timestamps.        |
| `emptyState`     | `ReactNode`     | `null`  | Shown when `messages` is empty.      |
| `className`      | `string`        | —       | Extra class names on the root.       |

### `<MessageBubble>`

| Prop            | Type          | Default | Description                       |
| --------------- | ------------- | ------- | --------------------------------- |
| `message`       | `ChatMessage` | —       | The message to render.            |
| `showTimestamp` | `boolean`     | `true`  | Hide the time label when `false`. |
| `className`     | `string`      | —       | Extra class names on the root.    |

### `<ChatInput>`

| Prop          | Type                     | Default               | Description                              |
| ------------- | ------------------------ | --------------------- | ---------------------------------------- |
| `onSend`      | `(text: string) => void` | —                     | Fired with trimmed text; blank ignored.  |
| `placeholder` | `string`                 | `"Type a message..."` | Textarea placeholder.                    |
| `disabled`    | `boolean`                | `false`               | Disables input and button.               |
| `sendLabel`   | `string`                 | `"Send"`              | Submit button label.                     |
| `className`   | `string`                 | —                     | Extra class names on the form.           |

### Helpers

| Function                          | Returns          | Description                                                   |
| --------------------------------- | ---------------- | ------------------------------------------------------------ |
| `groupByAuthor(messages)`         | `MessageGroup[]` | Groups consecutive same-role + same-author messages.         |
| `formatTimestamp(ts)`             | `string`         | Formats epoch ms as 24-hour `HH:MM` (local); `""` if invalid.|

### Types

`ChatRole = "user" | "assistant" | "system"`, plus `ChatMessage` and `MessageGroup`.

## Note

`react-chat-ui` ships intentionally minimal layout styling so it drops into any
design system. Target the stable `rcui-*` class names (and the `data-role`
attribute) to apply your own theme.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and our
[Code of Conduct](CODE_OF_CONDUCT.md). Run `npm install`, then `npm run typecheck`
and `npm test` before opening a pull request.

## Contact — Viprasol Tech Private Limited

- Website: [viprasol.com](https://viprasol.com)
- Email: [support@viprasol.com](mailto:support@viprasol.com)
- Telegram: [t.me/viprasol_help](https://t.me/viprasol_help) | WhatsApp: +91 96336 52112
- GitHub: [@Viprasol-Tech](https://github.com/Viprasol-Tech) | [LinkedIn](https://www.linkedin.com/in/viprasol/) | X [@viprasol](https://twitter.com/viprasol)

## License

[MIT](LICENSE) (c) 2025 Viprasol Tech Private Limited
