"use client";

import { useState } from "react";
import { Upload, Table, LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
//import { Progress } from "@/components/ui/progress";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChurnData {
  [key: string]: string | number | undefined;
  CustomerID: string;
  churnPrediction?: "Yes" | "No";
  clusterLabel?: number;
  x?: number;
  y?: number;
}

/**
 * getMockPrediction randomly sets a cluster for each customer, then randomly
 * assigns x and y positions. The x and y values are based on the cluster so that
 * points in the same cluster appear close together.
 */
const getMockPrediction = (): { churnPrediction: "Yes" | "No"; clusterLabel: number; x: number; y: number } => {
  const clusterLabel = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
  const churnPrediction = Math.random() > 0.7 ? "Yes" : "No";

  // Each cluster gets a different base coordinate.
  // Points within the same cluster will have coordinates near this base.
  const baseCoordinates = {
    1: { x: 50, y: 50 },
    2: { x: 200, y: 200 },
    3: { x: 350, y: 350 },
  };
  const base = baseCoordinates[clusterLabel as 1 | 2 | 3];

  return {
    churnPrediction,
    clusterLabel,
    x: base.x + Math.random() * 30, // a little random variation
    y: base.y + Math.random() * 30, // a little random variation
  };
};

// Tooltip shown when you hover on a point
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-medium">Customer ID: {data.CustomerID}</p>
        <p className={data.churnPrediction === "Yes" ? "text-destructive" : "text-primary"}>
          Churn: {data.churnPrediction}
        </p>
        <p>Cluster {data.clusterLabel}</p>
      </div>
    );
  }
  return null;
};

/**
 * Custom shape function for drawing the scatter points.
 * If a point is predicted to churn, we make it a larger yellow circle with a red border.
 * Otherwise, we draw a small circle.
 */
const renderCustomizedShape = (props: any) => {
  const { cx, cy, payload, fill } = props;
  if (payload.churnPrediction === "Yes") {
    // Show churn points with a "shine" effect.
    return <circle cx={cx} cy={cy} r={10} fill="yellow" stroke="red" strokeWidth={2} />;
  }
  return <circle cx={cx} cy={cy} r={5} fill={fill} />;
};

export default function Home() {
  const [data, setData] = useState<ChurnData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n");
      const headers = rows[0].split(",");

      const parsedData: ChurnData[] = [];

      // Skip header row and parse CSV rows
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === "") continue;
        const values = rows[i].split(",");
        const row: ChurnData = { CustomerID: "" };

        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim() || "";
        });
        parsedData.push(row);
      }

      // Process each row by randomly assigning cluster and (x,y) data
      const processedData = [];
      for (let i = 0; i < parsedData.length; i++) {
        // Simulate delay like an API call
        await new Promise(resolve => setTimeout(resolve, 100));
        const mockResult = getMockPrediction();
        processedData.push({
          ...parsedData[i],
          churnPrediction: mockResult.churnPrediction,
          clusterLabel: mockResult.clusterLabel,
          x: mockResult.x,
          y: mockResult.y,
        });
        setProgress(((i + 1) / parsedData.length) * 100);
      }
      setData(processedData);
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const getChurnStats = () => {
    const total = data.length;
    const churnCount = data.filter(row => row.churnPrediction === "Yes").length;
    return {
      total,
      churnCount,
      churnRate: total > 0 ? ((churnCount / total) * 100).toFixed(1) : "0"
    };
  };

  const stats = getChurnStats();

  // Group data by cluster so that points of the same cluster are shown together.
  const getClusterData = () => {
    const clusters: { [key: string]: ChurnData[] } = {};
    data.forEach(item => {
      const key = `cluster-${item.clusterLabel}-${item.churnPrediction}`;
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(item);
    });
    return clusters;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Telecom Customer Churn Analysis</h1>
            <p className="text-muted-foreground mt-2">
              Upload customer data to predict churn probability and view cluster analysis.
              <br />
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload CSV
            </label>
          </Button>
        </div>

        {loading && (
          <Card className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing data...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded">
                  <div
                    className="h-full bg-primary rounded transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
            </div>
          </Card>
        )}

        {data.length > 0 && !loading && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <LineChart className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <LineChart className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="text-sm text-muted-foreground">Predicted Churns</p>
                    <p className="text-2xl font-bold">{stats.churnCount}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <LineChart className="w-8 h-8 text-chart-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Churn Rate</p>
                    <p className="text-2xl font-bold">{stats.churnRate}%</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Customer Cluster Analysis</h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="x" name="X" />
                    <YAxis type="number" dataKey="y" name="Y" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {Object.entries(getClusterData()).map(([key, clusterData]) => {
                      // Break the key to get the cluster number
                      const [_, clusterNumber] = key.split("-");
                      const clusterColors: { [key: string]: string } = {
                        "1": "#3b82f6", // blue
                        "2": "#10b981", // green
                        "3": "#f59e0b", // amber
                      };
                      const fillColor = clusterColors[clusterNumber] || "#888";
                      return (
                        <Scatter
                          key={key}
                          name={`Cluster ${clusterNumber}`}
                          data={clusterData}
                          fill={fillColor}
                          shape={renderCustomizedShape}
                        />
                      );
                    })}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <UITable>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(data[0])
                        .filter((header) => header !== "x" && header !== "y")
                        .map((header) => (
                          <TableHead key={header} className="whitespace-nowrap">
                            {header}
                          </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => (
                      <TableRow key={index}>
                        {Object.entries(row)
                          .filter(([key]) => key !== "x" && key !== "y")
                          .map(([key, value]) => (
                            <TableCell
                              key={key}
                              className={`whitespace-nowrap ${
                                key === "churnPrediction"
                                  ? value === "Yes"
                                    ? "text-destructive font-medium"
                                    : "text-primary font-medium"
                                  : ""
                              }`}
                            >
                              {value}
                            </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </UITable>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
