import { useState } from 'react'
import Map from './components/Map'
import { LogIn, LogOut, User } from 'lucide-react'
import './App.css'

function App() {
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [popupPosition, setPopupPosition] = useState(null)
  
  const handleFacilityClick = (facility, position) => {
    setSelectedFacility(facility)
    setPopupPosition(position)
  }

  const handleClosePopup = () => {
    setSelectedFacility(null)
    setPopupPosition(null)
  }

  return (
    <div className="relative w-full h-screen">
      {/* ヘッダー */}
      <div className="absolute top-2.5 left-2.5 z-[1001] bg-white rounded-sm shadow-lg p-3 flex items-center gap-3 border border-gray-400">
        <h1 className="text-base font-bold text-gray-900">WikiWalk</h1>
      </div>

      {/* 地図 */}
      <Map onFacilityClick={handleFacilityClick} />

    </div>
  )
}

export default App
