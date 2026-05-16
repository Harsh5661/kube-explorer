import type { ReactNode } from "react";
import { Icon } from "./Icon";

export type PreviewLanguage = "javascript" | "json" | "markdown" | "env" | "text";

export function PreviewCode({
  fileName,
  language,
  source,
}: {
  fileName: string;
  language: PreviewLanguage;
  source?: string;
}) {
  if (!source) {
    return (
      <div className="preview__empty">
        <div className="preview__empty-icon">
          <Icon name="folder" className="resource-icon resource-icon--folder" />
        </div>
        <h3>{fileName}</h3>
        <p>
          Folder preview will show metadata, permissions, and quick actions here.
        </p>
      </div>
    );
  }

  const lines = source.split("\n");

  return (
    <div className="code-preview" role="presentation">
      {lines.map((line, index) => (
        <div key={`${fileName}-${index}`} className="code-line">
          <span className="code-line__number">{index + 1}</span>
          <span className="code-line__content">
            {renderHighlightedLine(line, language)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function getPreviewLanguage(fileName: string): PreviewLanguage {
  if (fileName.endsWith(".js")) {
    return "javascript";
  }

  if (fileName.endsWith(".json")) {
    return "json";
  }

  if (fileName.endsWith(".md")) {
    return "markdown";
  }

  if (fileName === ".env") {
    return "env";
  }

  return "text";
}

export function getPreviewFooterLabel(language: PreviewLanguage) {
  switch (language) {
    case "javascript":
      return "JavaScript";
    case "json":
      return "JSON";
    case "markdown":
      return "Markdown";
    case "env":
      return "Env";
    default:
      return "Text";
  }
}

function renderHighlightedLine(line: string, language: PreviewLanguage) {
  if (!line) {
    return <span>&nbsp;</span>;
  }

  if (language === "javascript") {
    return renderTokenizedLine(line, [
      { type: "comment", regex: /(\/\/.*$)/g },
      {
        type: "string",
        regex: /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g,
      },
      {
        type: "keyword",
        regex: /\b(const|let|var|require|process|app|get|status|json|send|listen)\b/g,
      },
      { type: "number", regex: /\b\d+\b/g },
    ]);
  }

  if (language === "json") {
    return renderTokenizedLine(line, [
      { type: "string", regex: /"(?:[^"\\]|\\.)*"/g },
      { type: "number", regex: /\b\d+\b/g },
    ]);
  }

  if (language === "env") {
    const parts = line.split("=");

    if (parts.length > 1) {
      return (
        <>
          <span className="token token--keyword">{parts[0]}</span>
          <span className="token token--dim">=</span>
          <span className="token token--string">{parts.slice(1).join("=")}</span>
        </>
      );
    }
  }

  if (language === "markdown" && line.startsWith("#")) {
    return <span className="token token--keyword">{line}</span>;
  }

  return <span>{line}</span>;
}

function renderTokenizedLine(
  line: string,
  rules: { type: "keyword" | "string" | "number" | "comment"; regex: RegExp }[],
) {
  const matches: { start: number; end: number; type: string }[] = [];

  for (const rule of rules) {
    rule.regex.lastIndex = 0;

    for (const match of line.matchAll(rule.regex)) {
      if (match.index === undefined) {
        continue;
      }

      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: rule.type,
      });
    }
  }

  matches.sort((left, right) => left.start - right.start || right.end - left.end);

  const filtered: typeof matches = [];

  for (const match of matches) {
    if (filtered.some((existing) => match.start < existing.end && match.end > existing.start)) {
      continue;
    }

    filtered.push(match);
  }

  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of filtered) {
    if (cursor < match.start) {
      parts.push(<span key={`plain-${cursor}`}>{line.slice(cursor, match.start)}</span>);
    }

    parts.push(
      <span
        key={`${match.type}-${match.start}`}
        className={`token token--${match.type}`}
      >
        {line.slice(match.start, match.end)}
      </span>,
    );
    cursor = match.end;
  }

  if (cursor < line.length) {
    parts.push(<span key={`plain-${cursor}`}>{line.slice(cursor)}</span>);
  }

  return parts;
}
