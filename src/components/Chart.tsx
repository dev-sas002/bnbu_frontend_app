// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/components/Chart.tsx
import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface User {
  user_type: string
}

interface ChartProps {
  data: User[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#000000']

const Chart: React.FC<ChartProps> = ({ data }) => {
  const userTypeCounts = data.reduce((acc, user) => {
    acc[user.user_type] = (acc[user.user_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(userTypeCounts).map(([name, value]) => ({ name, value }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default Chart