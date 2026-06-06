import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MessageList } from "../MessageList";
import { ChatInput } from "../ChatInput";
import { ChatWindow } from "../ChatWindow";
import { MessageBubble } from "../MessageBubble";
import { Avatar } from "../Avatar";
import { Attachment } from "../Attachment";
import { TypingIndicator } from "../TypingIndicator";
import { MarkdownText } from "../MarkdownText";
import type { ChatMessage } from "../types";

const messages: ChatMessage[] = [
  { id: "u1", role: "user", content: "Hello there", timestamp: 0, author: "Ada" },
  { id: "a1", role: "assistant", content: "Hi, how can I help?", timestamp: 1000 },
  { id: "s1", role: "system", content: "User left the chat", timestamp: 2000 },
];

describe("MessageList", () => {
  it("renders each message with role-specific styling", () => {
    render(
      <MessageList
        messages={messages}
        showTimestamps={false}
        showDateSeparators={false}
      />
    );

    const user = screen.getByTestId("bubble-u1");
    const assistant = screen.getByTestId("bubble-a1");
    const system = screen.getByTestId("bubble-s1");

    expect(user).toHaveAttribute("data-role", "user");
    expect(user.className).toContain("rcui-bubble--user");
    expect(assistant).toHaveAttribute("data-role", "assistant");
    expect(assistant.className).toContain("rcui-bubble--assistant");
    expect(system).toHaveAttribute("data-role", "system");
    expect(system.className).toContain("rcui-bubble--system");

    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("Hi, how can I help?")).toBeInTheDocument();
  });

  it("renders the empty state when there are no messages", () => {
    render(<MessageList messages={[]} emptyState={<p>No messages yet</p>} />);
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
  });

  it("shows an avatar per author run by default and hides it when disabled", () => {
    const { rerender } = render(
      <MessageList messages={messages} showDateSeparators={false} />
    );
    expect(screen.getByLabelText("Ada's avatar")).toBeInTheDocument();

    rerender(
      <MessageList
        messages={messages}
        showAvatars={false}
        showDateSeparators={false}
      />
    );
    expect(screen.queryByLabelText("Ada's avatar")).not.toBeInTheDocument();
  });

  it("inserts a single day separator for same-day messages", () => {
    const day = new Date(2024, 0, 1, 9, 0).getTime();
    const sameDay: ChatMessage[] = [
      { id: "1", role: "user", content: "a", timestamp: day },
      { id: "2", role: "assistant", content: "b", timestamp: day + 1000 },
    ];
    render(<MessageList messages={sameDay} />);
    expect(screen.getAllByRole("separator")).toHaveLength(1);
  });

  it("inserts separators across different days", () => {
    const d1 = new Date(2024, 0, 1, 9, 0).getTime();
    const d2 = new Date(2024, 0, 2, 9, 0).getTime();
    const acrossDays: ChatMessage[] = [
      { id: "1", role: "user", content: "a", timestamp: d1 },
      { id: "2", role: "assistant", content: "b", timestamp: d2 },
    ];
    render(<MessageList messages={acrossDays} />);
    expect(screen.getAllByRole("separator")).toHaveLength(2);
  });

  it("renders a typing indicator when typing is set", () => {
    render(<MessageList messages={[]} typing typingWho="Ada" />);
    expect(screen.getByTestId("typing-indicator")).toHaveAttribute(
      "aria-label",
      "Ada is typing"
    );
  });
});

describe("MessageBubble", () => {
  it("renders a delivery status tick with an accessible label", () => {
    render(
      <MessageBubble
        message={{
          id: "x",
          role: "user",
          content: "hi",
          timestamp: 0,
          status: "read",
        }}
      />
    );
    const status = screen.getByTestId("status-x");
    expect(status).toHaveAttribute("aria-label", "Read");
    expect(screen.getByTestId("bubble-x")).toHaveAttribute("data-status", "read");
  });

  it("omits the status tick when showStatus is false", () => {
    render(
      <MessageBubble
        showStatus={false}
        message={{
          id: "x",
          role: "user",
          content: "hi",
          timestamp: 0,
          status: "sent",
        }}
      />
    );
    expect(screen.queryByTestId("status-x")).not.toBeInTheDocument();
  });

  it("renders markdown by default and plain text when asked", () => {
    const message: ChatMessage = {
      id: "m",
      role: "assistant",
      content: "a **bold** word",
      timestamp: 0,
    };
    const { rerender } = render(<MessageBubble message={message} />);
    expect(screen.getByText("bold").tagName).toBe("STRONG");

    rerender(<MessageBubble message={message} plainText />);
    expect(screen.getByText("a **bold** word")).toBeInTheDocument();
  });

  it("renders attachments", () => {
    render(
      <MessageBubble
        message={{
          id: "m",
          role: "user",
          content: "",
          timestamp: 0,
          attachments: [
            { id: "f1", kind: "file", name: "doc.pdf", url: "/doc.pdf", size: 2048 },
          ],
        }}
      />
    );
    const att = screen.getByTestId("attachment-f1");
    expect(within(att).getByText("doc.pdf")).toBeInTheDocument();
    expect(within(att).getByText("2 KB")).toBeInTheDocument();
  });
});

describe("Avatar", () => {
  it("renders an image when src is provided", () => {
    render(<Avatar name="Ada" src="/a.png" />);
    const img = screen.getByAltText("Ada's avatar") as HTMLImageElement;
    expect(img.tagName).toBe("IMG");
  });

  it("falls back to initials when no src", () => {
    render(<Avatar name="Ada Lovelace" />);
    const el = screen.getByLabelText("Ada Lovelace's avatar");
    expect(el).toHaveTextContent("AL");
  });

  it("falls back to initials after an image load error", () => {
    render(<Avatar name="Bob" src="/missing.png" />);
    const img = screen.getByAltText("Bob's avatar");
    fireEvent.error(img);
    expect(screen.getByLabelText("Bob's avatar")).toHaveTextContent("B");
  });
});

describe("Attachment", () => {
  it("renders an image attachment as an image", () => {
    render(
      <Attachment
        attachment={{ id: "i1", kind: "image", name: "pic.png", url: "/pic.png" }}
      />
    );
    expect(screen.getByAltText("pic.png").tagName).toBe("IMG");
  });

  it("renders a file attachment as a download link with size", () => {
    render(
      <Attachment
        attachment={{
          id: "f1",
          kind: "file",
          name: "report.csv",
          url: "/report.csv",
          size: 1024,
        }}
      />
    );
    const link = screen.getByTestId("attachment-f1");
    expect(link).toHaveAttribute("download", "report.csv");
    expect(screen.getByText("1 KB")).toBeInTheDocument();
  });
});

describe("TypingIndicator", () => {
  it("labels a single typist", () => {
    render(<TypingIndicator who="Ada" />);
    expect(screen.getByTestId("typing-indicator")).toHaveAttribute(
      "aria-label",
      "Ada is typing"
    );
  });

  it("labels two typists", () => {
    render(<TypingIndicator who={["Ada", "Bob"]} />);
    expect(screen.getByTestId("typing-indicator")).toHaveAttribute(
      "aria-label",
      "Ada and Bob are typing"
    );
  });

  it("labels many typists", () => {
    render(<TypingIndicator who={["Ada", "Bob", "Cy"]} />);
    expect(screen.getByTestId("typing-indicator")).toHaveAttribute(
      "aria-label",
      "Ada and 2 others are typing"
    );
  });

  it("uses a generic label when nobody is named", () => {
    render(<TypingIndicator />);
    expect(screen.getByTestId("typing-indicator")).toHaveAttribute(
      "aria-label",
      "Someone is typing"
    );
  });
});

describe("MarkdownText", () => {
  it("renders links with safe rel attributes", () => {
    render(<MarkdownText text="[site](https://x.io)" />);
    const link = screen.getByText("site") as HTMLAnchorElement;
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://x.io");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("preserves newlines as line breaks", () => {
    const { container } = render(<MarkdownText text={"a\nb"} />);
    expect(container.querySelectorAll("br")).toHaveLength(1);
  });

  it("never renders injected HTML", () => {
    const { container } = render(<MarkdownText text="<img src=x onerror=1>" />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toBe("<img src=x onerror=1>");
  });
});

describe("ChatInput", () => {
  it("fires onSend with typed text and clears the field on submit", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const field = screen.getByLabelText("Message") as HTMLTextAreaElement;
    fireEvent.change(field, { target: { value: "  hello world  " } });

    const button = screen.getByRole("button", { name: "Send" });
    fireEvent.click(button);

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith("hello world");
    expect(field.value).toBe("");
  });

  it("submits on Enter but not on Shift+Enter", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const field = screen.getByLabelText("Message") as HTMLTextAreaElement;

    fireEvent.change(field, { target: { value: "first" } });
    fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();

    fireEvent.keyDown(field, { key: "Enter", shiftKey: false });
    expect(onSend).toHaveBeenCalledWith("first");
  });

  it("ignores blank submissions without attachments", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const field = screen.getByLabelText("Message") as HTMLTextAreaElement;

    fireEvent.change(field, { target: { value: "   " } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("allows sending an empty body when attachments are staged", () => {
    const onSend = vi.fn();
    render(
      <ChatInput
        onSend={onSend}
        pendingAttachments={[
          { id: "a", kind: "file", name: "f.txt", url: "/f.txt" },
        ]}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledWith("");
  });

  it("renders an attach button and forwards picked files", () => {
    const onAttach = vi.fn();
    render(<ChatInput onSend={vi.fn()} onAttach={onAttach} />);
    const input = screen.getByTestId("input-file") as HTMLInputElement;
    const file = new File(["x"], "x.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onAttach).toHaveBeenCalledTimes(1);
    expect(onAttach.mock.calls[0][0][0].name).toBe("x.txt");
  });

  it("renders removable attachment chips", () => {
    const onRemove = vi.fn();
    render(
      <ChatInput
        onSend={vi.fn()}
        pendingAttachments={[
          { id: "a", kind: "file", name: "f.txt", url: "/f.txt" },
        ]}
        onRemoveAttachment={onRemove}
      />
    );
    expect(screen.getByTestId("chip-a")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove f.txt" }));
    expect(onRemove).toHaveBeenCalledWith("a");
  });

  it("shows a character counter when maxLength is set", () => {
    render(<ChatInput onSend={vi.fn()} maxLength={10} />);
    const field = screen.getByLabelText("Message");
    fireEvent.change(field, { target: { value: "abc" } });
    expect(screen.getByTestId("input-counter")).toHaveTextContent("3/10");
  });
});

describe("ChatWindow", () => {
  it("renders messages and forwards composer submissions", () => {
    const onSend = vi.fn();
    render(
      <ChatWindow
        messages={messages}
        onSend={onSend}
        header={<span>Support</span>}
      />
    );

    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Hello there")).toBeInTheDocument();

    const field = screen.getByLabelText("Message") as HTMLTextAreaElement;
    fireEvent.change(field, { target: { value: "ping" } });
    fireEvent.keyDown(field, { key: "Enter" });

    expect(onSend).toHaveBeenCalledWith("ping");
    expect(field.value).toBe("");
  });

  it("auto-scrolls the body to the bottom on update", () => {
    const { rerender } = render(
      <ChatWindow messages={messages} onSend={vi.fn()} />
    );
    const body = screen.getByTestId("rcui-window-body");
    Object.defineProperty(body, "scrollHeight", {
      configurable: true,
      value: 500,
    });
    const next = [
      ...messages,
      { id: "u2", role: "user", content: "new", timestamp: 3000 } as ChatMessage,
    ];
    rerender(<ChatWindow messages={next} onSend={vi.fn()} />);
    expect(body.scrollTop).toBe(500);
  });

  it("forwards typing state into the list", () => {
    render(
      <ChatWindow messages={messages} onSend={vi.fn()} typing typingWho="Ada" />
    );
    expect(screen.getByTestId("typing-indicator")).toBeInTheDocument();
  });
});
