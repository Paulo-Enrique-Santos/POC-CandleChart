import { useEffect, useState } from 'react'
import ChartsSocketAPI from '../../../../api/charts/chartsSocketAPI'
import { XAxis, YAxis, Tooltip, BarChart, CartesianGrid, Bar, Brush } from 'recharts'

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
  const isDoji = height === 0
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
        x1={x1Line}
        x2={x2Line}
        y1={y1Line}
        y2={y2Line}
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

const Chart = () => {
  const [lastMessage, setLastMessage] = useState<any>()
  const [chartSeries, setChartSeries] = useState<any>([])
  const [minChartValue, setMinChartValue] = useState<number>()
  const [maxChartValue, setMaxChartValue] = useState<number>()

  async function getChartQuotes () {
    await ChartsSocketAPI.subscribeChartsBySymbol('PETR4')
      .then((res) => {
      })
  }

  function convertHistoryDataToStructure (history: any[]) {
    const newHistory = history.map((historyData) => {
      return {
        name: historyData.UpdateAt,
        high: historyData.MaxPrice,
        low: historyData.MinPrice,
        openClose: [historyData.OpenPrice, historyData.ClosePrice]
      }
    })

    return newHistory
  }

  function convertLastMessageToStructure (data: any) {
    return {
      name: data.UpdatedAt,
      high: data.MaxPrice,
      low: data.MinPrice,
      openClose: [data.OpenPrice, data.ClosePrice]
    }
  }

  useEffect(() => {
    void getChartQuotes()
  }, [])

  useEffect(() => {
    if (lastMessage?.History) {
      const newHistory = convertHistoryDataToStructure(lastMessage?.History)

      setChartSeries(newHistory)
      setLastMessage(lastMessage.History[lastMessage.History.length - 1])
    } else {
      const lastTime = new Date(lastMessage?.UpdatedAt)

      if (lastTime.getMinutes() === 0) {
        setChartSeries([...chartSeries, lastMessage])
      } else {
        const updatedChartSeries = chartSeries

        lastMessage && (updatedChartSeries[updatedChartSeries.length - 1] = convertLastMessageToStructure(lastMessage))
        setChartSeries(updatedChartSeries)
      }
    }
  }, [lastMessage])

  const dataMin = (data: any) => {
    const minValue = Number((Math.min(...data.flat()) * 0.998).toFixed(2))

    setMinChartValue(minValue)
    return minValue
  }

  const dataMax = (data: any) => {
    const maxValue = Number((Math.max(...data.flat()) * 1.002).toFixed(2))

    setMaxChartValue(maxValue)
    return maxValue
  }

  return (
    chartSeries && (
      <BarChart width={400} height={500} data={chartSeries}>
        <XAxis dataKey="name" />
        <YAxis domain={data => [dataMin(data), dataMax(data)]} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Bar dataKey="openClose" fill="#8884d8" shape={<CustomBar dataMax={maxChartValue} dataMin={minChartValue} />} />
        <Brush
          dataKey="name"
          height={30}
          stroke="#000"
          startIndex={chartSeries.length < 50 ? chartSeries.length - chartSeries.length - 1 : chartSeries.length - 50}
          endIndex={chartSeries.length - 1}
        />
      </BarChart>
    )
  )
}

export default Chart
