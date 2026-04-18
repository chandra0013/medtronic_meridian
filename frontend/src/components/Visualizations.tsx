"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const data = [
  { name: "Day 1", value: 400 },
  { name: "Day 2", value: 300 },
  { name: "Day 3", value: 600 },
  { name: "Day 4", value: 800 },
  { name: "Day 5", value: 500 },
  { name: "Day 6", value: 900 },
  { name: "Day 7", value: 1100 },
];

const COLORS = ["#1B4332", "#B7E4C7", "#D8F3DC", "#52796F"];

export function DeviceAreaChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B4332" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#1B4332" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#52796F', fontSize: 10 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#52796F', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#1B4332" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SignalDonutChart() {
  const pieData = [
    { name: "Critical", value: 40 },
    { name: "High", value: 30 },
    { name: "Moderate", value: 20 },
    { name: "Low", value: 10 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            strokeWidth={0}
            cornerRadius={8}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
