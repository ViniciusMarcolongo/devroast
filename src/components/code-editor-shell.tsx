"use client";

import { useMemo, useState } from "react";

import {
  Button,
  SwitchControl,
  SwitchLabel,
  SwitchRoot,
  SwitchThumb,
} from "@/components/ui";

type CodeEditorShellProps = {
  actionLabel?: string;
  helperText?: string;
  placeholder?: string;
};

export function CodeEditorShell({
  actionLabel = "$ roast_my_code",
  helperText = "allow tabs, 75k+ char limit, paste and cry",
  placeholder = "// paste your code here\n// we will roast it soon\n",
}: CodeEditorShellProps) {
  const [code, setCode] = useState("");

  const lineCount = useMemo(() => {
    const totalLines = code.length > 0 ? code.split("\n").length : 1;
    return Math.max(totalLines, 13);
  }, [code]);

  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, index) => index + 1),
    [lineCount],
  );

  const isDisabled = code.trim().length === 0;

  return (
    <div className="flex w-full max-w-[780px] flex-col gap-4">
      <div className="overflow-hidden border border-border-subtle bg-surface-primary">
        <div className="flex h-10 items-center gap-3 border-b border-border-subtle px-4">
          <span className="size-2.5 rounded-full bg-danger" />
          <span className="size-2.5 rounded-full bg-warning" />
          <span className="size-2.5 rounded-full bg-accent-green" />
          <span className="min-w-0 flex-1" />
          <span className="font-mono-ui text-[12px] text-text-tertiary">
            paste-your-code.ts
          </span>
        </div>

        <div className="grid min-h-[320px] grid-cols-[40px_minmax(0,1fr)] bg-[#101010]">
          <div className="border-r border-border-subtle/70 px-2 py-3 text-right font-mono-ui text-[12px] leading-[1.45] text-text-tertiary">
            {lineNumbers.map((lineNumber) => (
              <div key={lineNumber}>{lineNumber}</div>
            ))}
          </div>
          <div className="p-3">
            <textarea
              className="min-h-[320px] w-full resize-none border-0 bg-transparent font-mono-ui text-[13px] leading-[1.45] text-text-primary outline-none placeholder:text-text-tertiary"
              onChange={(event) => setCode(event.target.value)}
              placeholder={placeholder}
              spellCheck={false}
              value={code}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:text-left">
          <SwitchRoot defaultChecked>
            <SwitchControl>
              <SwitchThumb />
            </SwitchControl>
            <SwitchLabel>roast mode</SwitchLabel>
          </SwitchRoot>
          <p className="font-mono-body text-[11px] text-text-tertiary">
            {helperText}
          </p>
        </div>
        <Button className="min-w-[164px]" disabled={isDisabled}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
