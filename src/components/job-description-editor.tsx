"use client"

import Placeholder from "@tiptap/extension-placeholder"
import type { Editor } from "@tiptap/react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  ClipboardPaste,
  Heading2,
  Italic,
  List,
  ListOrdered,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  clipboardDraftToHtml,
  readClipboardDraft,
} from "@/lib/ai-clipboard-content"
import { cn } from "cn"

const PLACEHOLDER =
  "Role overview, schedule, and what a great hire looks like…"

function removeEmptyTopLevelParagraphs(editor: Editor) {
  const { doc } = editor.state
  const toRemove: { from: number; to: number }[] = []

  doc.descendants((node, pos) => {
    if (node.type.name !== "paragraph") return
    const parent = doc.resolve(pos).parent
    if (parent.type.name === "listItem") return
    if (node.textContent.replace(/\u00a0/g, " ").trim() === "") {
      toRemove.push({ from: pos, to: pos + node.nodeSize })
    }
  })

  if (toRemove.length === 0) return

  let transaction = editor.state.tr
  for (const range of toRemove.sort((a, b) => b.from - a.from)) {
    transaction = transaction.delete(range.from, range.to)
  }
  editor.view.dispatch(transaction)
}

export function JobDescriptionEditor({
  id = "job-description",
  value,
  onChange,
  onPasteFeedback,
}: {
  id?: string
  value: string
  onChange: (html: string) => void
  onPasteFeedback?: (message: string, variant?: "success" | "error") => void
}) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
      }),
      Placeholder.configure({ placeholder: PLACEHOLDER }),
    ],
    content: value,
    editorProps: {
      attributes: {
        id,
        "aria-label": "Job description",
        class:
          "min-h-32 max-h-56 overflow-y-auto px-3 py-2.5 text-sm leading-normal outline-none [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-sm [&_h2]:font-semibold [&_li>p]:my-0 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML())
    },
  })

  async function pasteAiDraft() {
    if (!editor) return
    try {
      const { html, plain } = await readClipboardDraft()
      const draftHtml = clipboardDraftToHtml({ html, plain })
      if (!draftHtml.trim()) {
        onPasteFeedback?.("Clipboard is empty.", "error")
        return
      }
      editor.chain().focus().setContent(draftHtml).run()
      removeEmptyTopLevelParagraphs(editor)
      onPasteFeedback?.("Pasted AI draft into description.", "success")
    } catch {
      onPasteFeedback?.(
        "Could not read the clipboard. Allow paste access and try again.",
        "error"
      )
    }
  }

  return (
    <div
      className={cn(
        "job-description-editor overflow-hidden rounded-xl border border-input bg-transparent",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
      )}
    >
      <div className="flex items-center gap-0.5 border-b px-1.5 py-1">
        <ToolbarButton
          label="Bold"
          active={editor?.isActive("bold") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor?.isActive("italic") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          label="Heading"
          active={editor?.isActive("heading", { level: 2 }) ?? false}
          disabled={!editor}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor?.isActive("bulletList") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor?.isActive("orderedList") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </ToolbarButton>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto h-8 gap-1.5 rounded-lg px-2 text-xs"
          disabled={!editor}
          onPointerDown={(event) => {
            event.preventDefault()
            void pasteAiDraft()
          }}
        >
          <ClipboardPaste className="size-3.5" aria-hidden />
          Paste AI Draft
        </Button>
      </div>
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="min-h-32 px-3 py-2.5 text-sm text-muted-foreground">
          {PLACEHOLDER}
        </div>
      )}
    </div>
  )
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active: boolean
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      className="rounded-lg"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onPointerDown={(event) => {
        event.preventDefault()
        onClick()
      }}
    >
      {children}
    </Button>
  )
}
