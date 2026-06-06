# Changelog

Format based on [Keep a Changelog](https://keepachangelog.com/); versioning
follows [SemVer](https://semver.org/).

## [0.2.0] - 2025

### Added
- **Typing indicator** (`TypingIndicator`) with an animated three-dot row and a
  smart accessible label ("Ada is typing", "Ada and 2 others are typing").
- **Message delivery status** ticks (`sending` / `sent` / `delivered` / `read` /
  `error`) on `MessageBubble`, plus `statusLabel` / `statusGlyph` helpers.
- **Avatars** (`Avatar`) with image support and a colored initials fallback that
  also kicks in on image load error; rendered per author run in `MessageList`.
- **Day separators** ("Today" / "Yesterday" / localized date) via
  `formatDayLabel` and `isSameDay`, toggleable with `showDateSeparators`.
- **Attachments** (`Attachment` + `ChatAttachment` type): image thumbnails and
  file download chips, with a removable staged-chip row in `ChatInput`.
- **Safe inline markdown** rendering (`MarkdownText` + `parseInlineMarkdown`):
  `**bold**`, `*italic*`, `` `code` ``, and `[link](href)` restricted to
  `http(s):` / `mailto:` schemes. No raw HTML is ever interpreted (XSS-safe).
- **Auto-scroll** to the newest message in `ChatWindow` (`autoScroll` prop).
- `ChatInput` enhancements: attachment picker (`onAttach`), character counter
  (`maxLength`), and the ability to send attachment-only messages.
- New helpers `getInitials` and `formatBytes`.
- New exported types: `MessageStatus`, `ChatAttachment`, `MarkdownToken`, and an
  `avatarUrl` field on `MessageGroup`.

### Changed
- `ChatMessage` gained optional `avatarUrl`, `status`, and `attachments` fields.
- `MessageList` and `ChatWindow` accept `showStatus`, `showAvatars`,
  `showDateSeparators`, `plainText`, `typing`, and `typingWho` props.
- Roughly doubled the test suite (60 tests across logic + component rendering).

## [0.1.0] - 2025

### Added
- Initial release of react-chat-ui: Composable chat UI kit (message list, bubbles, input) for React.
