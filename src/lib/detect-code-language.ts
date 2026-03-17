import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";

import type { SupportedCodeLanguageId } from "@/lib/code-languages";

let isRegistered = false;

function registerLanguages() {
  if (isRegistered) {
    return;
  }

  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("html", html);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("sql", sql);
  hljs.registerLanguage("typescript", typescript);

  isRegistered = true;
}

function looksLikeJson(code: string) {
  const trimmedCode = code.trim();

  if (
    !(trimmedCode.startsWith("{") || trimmedCode.startsWith("[")) ||
    !/[}\]]$/.test(trimmedCode)
  ) {
    return false;
  }

  try {
    JSON.parse(trimmedCode);
    return true;
  } catch {
    return false;
  }
}

function looksLikeHtml(code: string) {
  return /<!doctype html>|<html|<body|<head|<div|<span|<main|<section|<script|<style/i.test(
    code,
  );
}

function looksLikeCss(code: string) {
  return (
    /(^|\n)\s*[@.#]?[a-zA-Z][\w-]*(\s*[>+~]\s*[a-zA-Z.#][\w-]*)*\s*\{/.test(
      code,
    ) && /:[^;{}\n]+;/.test(code)
  );
}

function looksLikeSql(code: string) {
  return /\b(select|insert|update|delete|create table|alter table|drop table|with)\b/i.test(
    code,
  );
}

function looksLikeBash(code: string) {
  return (
    /^#!\/bin\/(ba)?sh/.test(code) ||
    /(^|\n)\s*(npm|pnpm|yarn|git|docker|kubectl|cd|ls|mkdir|rm)\b/.test(code) ||
    /\$\s+[\w-]+/.test(code)
  );
}

function looksLikeJsx(code: string) {
  return /<([A-Z][A-Za-z0-9]*|[a-z]+)(\s+[^>]*?)?>/.test(code);
}

function looksLikeTypeScript(code: string) {
  return /\b(interface|type|enum|implements|readonly|declare)\b|:\s*[A-Z_a-z][\w<>, [\]|&]*\s*(=|;|,|\)|\n)/.test(
    code,
  );
}

function mapDetectedLanguage(
  detectedLanguage: string | undefined,
  code: string,
): SupportedCodeLanguageId {
  const trimmedCode = code.trim();

  if (trimmedCode.length === 0) {
    return "plaintext";
  }

  if (trimmedCode.length < 6 && !/[{}();:<>=]/.test(trimmedCode)) {
    return "plaintext";
  }

  if (looksLikeJson(trimmedCode)) {
    return "json";
  }

  if (looksLikeHtml(trimmedCode)) {
    return "html";
  }

  if (looksLikeCss(trimmedCode)) {
    return "css";
  }

  if (looksLikeSql(trimmedCode)) {
    return "sql";
  }

  if (looksLikeBash(trimmedCode)) {
    return "bash";
  }

  if (detectedLanguage === "typescript") {
    return looksLikeJsx(trimmedCode) ? "tsx" : "typescript";
  }

  if (detectedLanguage === "javascript") {
    if (looksLikeJsx(trimmedCode)) {
      return looksLikeTypeScript(trimmedCode) ? "tsx" : "jsx";
    }

    return looksLikeTypeScript(trimmedCode) ? "typescript" : "javascript";
  }

  switch (detectedLanguage) {
    case "json":
    case "python":
    case "sql":
    case "css":
    case "bash":
      return detectedLanguage;
    case "html":
    case "xml":
      return "html";
    default:
      if (looksLikeJsx(trimmedCode)) {
        return looksLikeTypeScript(trimmedCode) ? "tsx" : "jsx";
      }

      if (looksLikeTypeScript(trimmedCode)) {
        return "typescript";
      }

      return "plaintext";
  }
}

export function detectCodeLanguage(code: string): SupportedCodeLanguageId {
  const trimmedCode = code.trim();

  if (trimmedCode.length === 0) {
    return "plaintext";
  }

  if (trimmedCode.length > 75000) {
    return "plaintext";
  }

  registerLanguages();

  const detectedLanguage = hljs.highlightAuto(trimmedCode, [
    "bash",
    "css",
    "html",
    "javascript",
    "json",
    "python",
    "sql",
    "typescript",
  ]).language;

  return mapDetectedLanguage(detectedLanguage, trimmedCode);
}
