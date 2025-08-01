import React from 'react'
import { Database, Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { useDatabaseConnection } from '../hooks/useDatabase'

const DatabaseStatus: React.FC = () => {
  const { isConnected, isLoading } = useDatabaseConnection()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-full border border-yellow-200">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
        <span className="text-sm text-yellow-700 font-medium">Connecting...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-full border ${
      isConnected 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center space-x-1">
        <Database className={`h-4 w-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
        {isConnected ? (
          <Wifi className="h-3 w-3 text-green-600" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-600" />
        )}
      </div>
      <span className={`text-sm font-medium ${
        isConnected ? 'text-green-700' : 'text-red-700'
      }`}>
        {isConnected ? 'Database Connected' : 'Database Offline'}
      </span>
    </div>
  )
}

export default DatabaseStatus