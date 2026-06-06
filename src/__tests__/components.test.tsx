import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessageList } from "../MessageList";
import { ChatInput } from "../ChatInput";
import { ChatWindow } from "../ChatWindow";
import type { ChatMessage } from "../types";

const messages: ChatMessage[] = [
  { id: "u1", role: "user", content: "Hello there", timestamp: 0, author: "Ada" },
  { id: "a1", role: "assistant", content: "Hi, how can I help?", timestamp: 1000 },
  { id: "s1", role: "system", content: "User left the chat", timestamp: 2000 },
];

describe("MessageList", () => {
  it("renders each message with role-specific styling", () => {
    render(<MessageList messages={messages} showTimestamps={false} />);

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
    render(
      <MessageList messages={[]} emptyState={<p>No messages yet</p>} />
    );
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
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

  it("ignores blank submissions", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const field = screen.getByLabelText("Message") as HTMLTextAreaElement;

    fireEvent.change(field, { target: { value: "   " } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
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
});
