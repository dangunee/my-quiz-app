"use client";

import React, { useRef, useEffect, useCallback } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

export function RichTextEditor({ value, onChange, placeholder, className = "", minHeight = "300px" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    isInternalChange.current = true;
    onChange(el.innerHTML);
  }, [onChange]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const html = e.clipboardData?.getData("text/html");
      if (html) {
        e.preventDefault();
        document.execCommand("insertHTML", false, html);
        handleInput();
      }
    },
    [handleInput]
  );

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const ToolbarButton = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) => (
    <button type="button" onClick={onClick} title={title} className="p-1.5 rounded hover:bg-gray-200 text-gray-700">
      {children}
    </button>
  );

  return (
    <div className={`border rounded overflow-hidden bg-white ${className}`}>
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-gray-100 border-b">
        <ToolbarButton onClick={() => execCmd("undo")} title="실행 취소">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd("redo")} title="다시 실행">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6 6" /></svg>
        </ToolbarButton>
        <span className="w-px h-5 bg-gray-300 mx-0.5" />
        <ToolbarButton onClick={() => execCmd("bold")} title="굵게">
          <span className="font-bold text-sm">B</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd("italic")} title="기울임">
          <span className="italic text-sm">I</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd("underline")} title="밑줄">
          <span className="underline text-sm">U</span>
        </ToolbarButton>
        <span className="w-px h-5 bg-gray-300 mx-0.5" />
        <ToolbarButton onClick={() => execCmd("insertUnorderedList")} title="글머리 기호">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="6" r="1.5" /><circle cx="5" cy="12" r="1.5" /><circle cx="5" cy="18" r="1.5" /><path d="M9 6h12M9 12h12M9 18h12" stroke="currentColor" strokeWidth="1.5" /></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd("insertOrderedList")} title="번호 매기기">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10M4 6v2M4 10v2M4 14v2" /></svg>
        </ToolbarButton>
        <span className="w-px h-5 bg-gray-300 mx-0.5" />
        <ToolbarButton onClick={() => execCmd("formatBlock", "h2")} title="제목 2">
          <span className="text-xs font-semibold">H2</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd("formatBlock", "h3")} title="제목 3">
          <span className="text-xs font-semibold">H3</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd("formatBlock", "p")} title="본문">
          <span className="text-xs">P</span>
        </ToolbarButton>
        <span className="w-px h-5 bg-gray-300 mx-0.5" />
        <ToolbarButton onClick={() => execCmd("justifyLeft")} title="왼쪽 정렬">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" /></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd("justifyCenter")} title="가운데 정렬">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" /></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd("justifyRight")} title="오른쪽 정렬">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" /></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd("createLink", prompt("URL 입력:") || undefined)} title="링크">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.172-1.172a4 4 0 00-5.656-5.656l-4 4a6 6 0 108.485 8.485L12 21m2.828-2.828l4-4a6 6 0 00-8.485-8.485l-1.172 1.172" /></svg>
        </ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="qna-rich-editor kotae-blog-content p-3 text-sm text-gray-800 overflow-y-auto outline-none min-h-[200px]"
        style={{ minHeight }}
        suppressContentEditableWarning
      />
    </div>
  );
}
