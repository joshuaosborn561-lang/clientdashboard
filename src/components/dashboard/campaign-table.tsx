"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Column {
  header: string;
  accessor: string;
  align?: "left" | "right";
  render?: (value: unknown) => React.ReactNode;
}

interface CampaignTableProps {
  title: string;
  columns: Column[];
  data: Record<string, unknown>[];
}

export function CampaignTable({ title, columns, data }: CampaignTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                {columns.map((col) => (
                  <th
                    key={col.accessor}
                    className={`pb-3 pr-4 font-medium ${
                      col.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  {columns.map((col) => (
                    <td
                      key={col.accessor}
                      className={`py-3 pr-4 ${
                        col.align === "right" ? "text-right" : ""
                      }`}
                    >
                      {col.render
                        ? col.render(row[col.accessor])
                        : String(row[col.accessor] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
