import { useMemo } from "react";
import { CheckinCount, useCheckinCount } from "../models";
import { AxisOptions, Chart } from "react-charts";

export function DailyChart() {
  const count = useCheckinCount();

  const primaryAxis = useMemo(
    (): AxisOptions<CheckinCount> => ({
      getValue: (datum) => {
        return datum.name as unknown as string;
      },
    }),
    []
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<CheckinCount>[] => [
      {
        getValue: (datum) => datum.count as unknown as number,
        elementType: 'line',
      },
    ],
    []
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Class Chart</h2>
      <div style={{ height: 200 }}>
        {count.status == "success" && count.data ? (
          <Chart
            options={{
              data: count.data,
              primaryAxis,
              secondaryAxes,
            }}
          />
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
