import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

interface Props {
  data: { label: string; value: number }[]
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981']

export function PieDistribution({ data }: Props) {
  // Use absolute values so negative outflows still contribute proportional slice size
  const processed = data.map(d => ({ ...d, value: Math.abs(d.value) }))
  const total = processed.reduce((sum, d) => sum + d.value, 0)
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={processed} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {processed.map((entry, index) => (
              <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val: any, name: any) => [`${Math.abs(val)} kr (${total ? ((Math.abs(val)/total)*100).toFixed(1) : '0.0'}%)`, name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
