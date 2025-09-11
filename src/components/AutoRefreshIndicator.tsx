import React from 'react'
import { Activity, Clock } from 'lucide-react'

interface AutoRefreshIndicatorProps {
  lastRefresh: Date
  interval?: number
  showInterval?: boolean
  size?: 'sm' | 'md'
  className?: string
}

const AutoRefreshIndicator: React.FC<AutoRefreshIndicatorProps> = ({
  lastRefresh,
  interval = 15,
  showInterval = true,
  size = 'sm',
  className = ''
}) => {
  const iconSize = size === 'sm' ? 12 : 16
  const textClass = size === 'sm' ? 'small' : ''

  return (
    <small className={`text-muted ${textClass} ${className}`}>
      <Activity size={iconSize} className="me-1" />
      {showInterval && (
        <>
          Actualización automática cada {interval}s | 
        </>
      )}
      <Clock size={iconSize} className="ms-1 me-1" />
      Última actualización: {lastRefresh.toLocaleTimeString()}
    </small>
  )
}

export default AutoRefreshIndicator