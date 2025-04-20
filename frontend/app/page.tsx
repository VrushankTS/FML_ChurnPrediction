"use client";

import { useState, useMemo } from "react";
import { Upload, LineChart } from "lucide-react";
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


const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-medium">Customer ID: {data.CustomerID}</p>
        <p
          className={
            data.churnPrediction === "Yes"
              ? "text-destructive"
              : "text-primary"
          }
        >
          Churn: {data.churnPrediction}
        </p>
        <p>Cluster {data.clusterLabel}</p>
      </div>
    );
  }
  return null;
};


const renderCustomizedShape = (props: any) => {
  const { cx, cy, payload, fill } = props;
  const isChurn = payload.churnPrediction === "Yes";
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={fill} 
      stroke={isChurn ? "red" : "none"} 
      strokeWidth={isChurn ? 2 : 0} 
    />
  );
};

export default function Home() {
  const [data, setData] = useState<ChurnData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [churnFilter, setChurnFilter] = useState('All');
  const [clusterFilter, setClusterFilter] = useState('All');
  

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === "") continue;
        const values = rows[i].split(",");
        const row: any = {}; 
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim() || "";
        });
        parsedData.push(row);
      }

      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedData),
        });

        const result = await response.json();
        const predictions = result.predictions;

        const baseCoordinates = {
          1: { x: 50, y: 50 },
          2: { x: 200, y: 200 },
          3: { x: 350, y: 350 },
        };

        const processedData = parsedData.map((row, i) => {
          const prediction = predictions[i];
          const base = baseCoordinates[prediction.ClusterGroup as 1 | 2 | 3];
          return {
            CustomerID: row.CustomerID,
            churnPrediction:
              prediction.PredictedChurn === 1 ? "Yes" as const : "No" as const,
            clusterLabel: prediction.ClusterGroup,
            x: base.x + Math.random() * 30,
            y: base.y + Math.random() * 30,
          };
        });

        setData(processedData);
      } catch (error) {
        console.error("Error fetching predictions:", error);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const getChurnStats = () => {
    const total = data.length;
    const churnCount = data.filter(
      (row) => row.churnPrediction === "Yes"
    ).length;
    return {
      total,
      churnCount,
      churnRate: total > 0 ? ((churnCount / total) * 100).toFixed(1) : "0",
    };
  };

  const stats = getChurnStats();

  const getClusterData = () => {
    const clusters: { [key: string]: ChurnData[] } = {};
    data.forEach((item) => {
      const key = `cluster-${item.clusterLabel}`;
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(item);
    });
    return clusters;
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const churnMatch = churnFilter === 'All' || row.churnPrediction === churnFilter;
      const clusterMatch =
        clusterFilter === 'All' || String(row.clusterLabel) === clusterFilter;
      return churnMatch && clusterMatch;
    });
  }, [data, churnFilter, clusterFilter]);
  

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Telecom Customer Churn Analysis
            </h1>
            <p className="text-muted-foreground mt-2">
              Upload customer data to predict churn probability and view cluster
              analysis.
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
                    <p className="text-sm text-muted-foreground">
                      Predicted Churns
                    </p>
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
              <h2 className="text-xl font-semibold mb-4">
                Customer Cluster Analysis
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis type="number" dataKey="x" name="X" />
                    <YAxis type="number" dataKey="y" name="Y" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {Object.entries(getClusterData()).map(([key, clusterData]) => {
                      const [_, clusterNumber] = key.split("-");
                      const clusterColors: { [key: string]: string } = {
                        "1": "#3b82f6", // blue for Cluster 1
                        "2": "#10b981", // green for Cluster 2
                        "3": "#f59e0b", // amber for Cluster 3
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

            {/* <Card className="overflow-hidden"> */}
            <div className="flex gap-4 items-center">
              {/* Churn Filter */}
              <div>
                <label className="mr-2 font-medium">Churn:</label>
                <select
                  value={churnFilter}
                  onChange={(e) => setChurnFilter(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="All">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Cluster Filter */}
              <div>
                <label className="mr-2 font-medium">Cluster:</label>
                <select
                  value={clusterFilter}
                  onChange={(e) => setClusterFilter(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="All">All</option>
                  <option value="1">Cluster 1</option>
                  <option value="2">Cluster 2</option>
                  <option value="3">Cluster 3</option>
                </select>
              </div>
            </div>

            <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <UITable>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">CustomerID</TableHead>
                <TableHead className="whitespace-nowrap">Churn Prediction</TableHead>
                <TableHead className="whitespace-nowrap">Cluster Label</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="whitespace-nowrap">{row.CustomerID}</TableCell>
                  <TableCell
                    className={`whitespace-nowrap ${
                      row.churnPrediction === 'Yes'
                        ? 'text-destructive font-medium'
                        : 'text-primary font-medium'
                    }`}
                  >
                    {row.churnPrediction}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row.clusterLabel}
                  </TableCell>
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
