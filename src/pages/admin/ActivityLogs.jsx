import { useDataStore } from '../../context/DataStore'
import { Clock, User, Package, ShoppingCart, Settings, AlertTriangle } from 'lucide-react'

const iconMap = { User, Package, ShoppingCart, Settings, AlertTriangle }
const typeColors = { user: 'badge-blue', product: 'badge-green', order: 'badge-yellow', system: 'badge-red' }

export default function ActivityLogs() {
  const { activityLogs } = useDataStore()
  return (
    <div>
      <h1 className="page-title">Activity Logs</h1>

      <div className="card">
        <div className="divide-y divide-gray-100">
          {activityLogs.map(log => {
            const Icon = iconMap[log.icon] || Settings
            return (
              <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-sm text-gray-500">by {log.user}</p>
                  {log.details && <p className="text-xs text-gray-400 mt-0.5">{log.details}</p>}
                </div>
                <div className="text-right shrink-0">
                  <span className={`badge capitalize ${typeColors[log.type]}`}>{log.type}</span>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> {log.time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
