import { useEffect, useState } from 'react'

import { XAxis, YAxis, Tooltip, BarChart, CartesianGrid, Bar, Brush, ResponsiveContainer } from 'recharts'
import { Card, CardContent, Typography } from '@mui/material'

const CustomBar = (props: any) => {
  const {
    x,
    y,
    width,
    height,
    low,
    high,
    dataMax,
    dataMin,
    openClose: [open, close]
  } = props

  const isGrowing = height >= 0
  const isDoji = height === 0 || open === close
  const dojiSize = props.background.height * (0.01 / (dataMax - dataMin))
  const currentHeight = isDoji ? 1 : (isGrowing ? height : (height * -1))
  const color = isDoji ? 'gray' : (isGrowing ? 'green' : 'red')
  const ratio = isDoji ? Math.abs(dojiSize / 0.01) : Math.abs(currentHeight / (open - close))

  const x1Line = x + width / 2
  const x2Line = x + width / 2
  const y1Line = isGrowing
    ? y + currentHeight + (open - high) * ratio
    : y - currentHeight + (open - high) * ratio
  const y2Line = isGrowing
    ? y + (close - low) * ratio
    : y + (close - low) * ratio

  return (
    <g>
      <line
        x1={x1Line || 0}
        x2={x2Line || 0}
        y1={y1Line || 0}
        y2={y2Line || 0}
        stroke={color}
        strokeWidth={2} />
      <rect
        x={x}
        y={isGrowing ? y : y - currentHeight}
        width={width}
        height={currentHeight} fill={color} />
    </g>
  )
}

const CustomTooltip = (props: any) => {
  const payload = props.payload.length > 0 ? props.payload[0].payload : null

  const convertDate = (isoDate: string) => {
    if (!isoDate) {
      return null
    }
    const date = new Date(isoDate.replace('Z', ''))
    const options = { timeZone: 'America/Sao_Paulo' }
    const formattedDate = date.toLocaleString('pt-BR', options)
    return `${formattedDate}`
  }

  return payload
    ? (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.primary">
            Horário: {convertDate(payload.name)}
          </Typography>
          <Typography sx={{ fontSize: 13 }} color="text.secondary" gutterBottom>
            Abertura: {payload.openClose[0]}
          </Typography>
          <Typography sx={{ fontSize: 13 }} color="text.secondary" gutterBottom>
            Fechamento: {payload.openClose[1]}
          </Typography>
          <Typography sx={{ fontSize: 13 }} color="text.secondary" gutterBottom>
            Máxima: {payload.high}
          </Typography>
          <Typography sx={{ fontSize: 13 }} color="text.secondary">
            Mínima: {payload.low}
          </Typography>
        </CardContent>
      </Card>)
    : (null)
}


const ChartCard = () => {
  const [chartDataList, setChartDataList] = useState([
    {label: "10:45", name: "2023-01-05T10:45:00Z", high: 20.30, low: 20.22, openClose: [20.24, 20.29]},
    {label: "10:46", name: "2023-01-05T10:46:00Z", high: 20.50, low: 20.28, openClose: [20.29, 20.42]},
    {label: "10:47", name: "2023-01-05T10:47:00Z", high: 20.63, low: 20.10, openClose: [20.42, 20.18]},
    {label: "10:48", name: "2023-01-05T10:48:00Z", high: 20.20, low: 20.18, openClose: [20.18, 20.20]},
    {label: "10:49", name: "2023-01-05T10:49:00Z", high: 20.20, low: 20.16, openClose: [20.20, 20.16]}
  ])
  const [minChartValue, setMinChartValue] = useState<number>()
  const [maxChartValue, setMaxChartValue] = useState<number>()
  const [domain, setDomain] = useState([0, chartDataList.length - 1])

  const dataMin = (data: number[]) => {
    const minValue = Number((Math.min(...data.flat()) * 0.992).toFixed(2))

    setMinChartValue(minValue)
    return minValue
  }

  const dataMax = (data: number[]) => {
    const maxValue = Number((Math.max(...data.flat()) * 1.012).toFixed(2))

    setMaxChartValue(maxValue)
    return maxValue
  }

  const handleBrushChange = (newDomain: any) => {
    setDomain([newDomain.startIndex, newDomain.endIndex])
  }

  return (
    chartDataList && (
      <ResponsiveContainer>
        <BarChart width={900} height={500} data={chartDataList}>
          <XAxis dataKey="label" domain={domain} />
          <YAxis domain={data => [dataMin(data), dataMax(data)]} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="openClose" fill="#8884d8" shape={<CustomBar dataMax={maxChartValue} dataMin={minChartValue} />} />
          <Brush
            onChange={handleBrushChange}
            dataKey="label"
            height={30}
            stroke="#000"
            startIndex={domain[0]}
            endIndex={domain[1]}
          />
        </BarChart>
      </ResponsiveContainer>)
  )
}

export default ChartCard
