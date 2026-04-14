"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportData } from "@/types/view-models";

const COLORS = ["#7b4ea0", "#2563eb", "#059669"];

export function PrincipalDashboard({ report }: { report: ReportData }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Sessions by R</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={report.byR} dataKey="value" nameKey="name" innerRadius={55} outerRadius={84}>
                {report.byR.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessions by grade</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.byGrade}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2d6a4f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top infractions</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.topInfractions} layout="vertical">
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill="#b7950b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Murāqabah watchlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.flaggedStudents.length === 0 ? (
            <p className="text-sm text-text-secondary">No active flags in this range.</p>
          ) : (
            report.flaggedStudents.map((student) => (
              <div key={student.sessionId} className="rounded-3xl border border-border bg-white p-4">
                <p className="font-semibold text-text-primary">{student.name}</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Grade {student.grade} · {student.reason.replaceAll("_", " ")}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

