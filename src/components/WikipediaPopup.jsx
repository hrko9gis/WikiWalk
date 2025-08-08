import { useState, useEffect } from 'react'
import { ExternalLink, X, Edit } from 'lucide-react'

const WikipediaPopup = ({ facility, position, onClose, onEdit, isLoggedIn }) => {
  const [wikipediaData, setWikipediaData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (facility) {
      // 常に詳細情報を取得する
      fetchWikipediaData(facility.wikipediaTitle || facility.name)
    }
  }, [facility])

  const fetchWikipediaData = async (title) => {
    setLoading(true)
    setError(null)
    
    try {
      // Wikipedia APIから記事情報を取得
      const response = await fetch(
        `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
      )
      
      if (!response.ok) {
        throw new Error('Wikipedia記事が見つかりませんでした')
      }
      
      const data = await response.json()
      setWikipediaData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = () => {
    if (onEdit && wikipediaData) {
      onEdit({
        title: wikipediaData.title,
        extract: wikipediaData.extract,
        thumbnail: wikipediaData.thumbnail?.source
      });
    }
  }

  if (!facility || !position) return null

  return (
    <>
      {/* ポップアップ */}
      <div 
        className="fixed z-[1060] bg-white rounded-lg shadow-xl border max-w-sm w-80"
        style={{
          top: '80px',
          right: '20px'
        }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-3">
          <h3 className="font-semibold text-gray-900 text-sm">
            {facility.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </>
  )
}

export default WikipediaPopup

