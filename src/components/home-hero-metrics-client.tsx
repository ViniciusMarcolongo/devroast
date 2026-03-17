"use client";

import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useTRPC } from "@/trpc/client";

function AnimatedMetricNumber({
  decimals = 0,
  suffix,
  value,
}: {
  decimals?: number;
  suffix?: string;
  value: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <NumberFlow
      className="tabular-nums"
      format={{
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
        useGrouping: true,
      }}
      suffix={suffix}
      value={displayValue}
      willChange
    />
  );
}

export function HomeHeroMetricsClient() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.home.metrics.queryOptions(undefined));

  return (
    <NumberFlowGroup>
      <div className="flex items-center gap-5 font-mono-body text-[11px] text-text-tertiary">
        <span>
          <AnimatedMetricNumber value={data.roastedCodesCount} /> codes roasted
        </span>
        <span>
          avg score:{" "}
          <AnimatedMetricNumber
            decimals={1}
            suffix="/10"
            value={data.avgScore}
          />
        </span>
      </div>
    </NumberFlowGroup>
  );
}
