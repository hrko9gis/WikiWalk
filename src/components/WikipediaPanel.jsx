import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, X, Edit } from 'lucide-react'

const WikipediaPanel = ({ facility, onClose, onEdit, isLoggedIn }) => {
  const [wikipediaData, setWikipediaData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (facility) {
      // 常に詳細情報を取得する（Geosearch結果でも詳細情報を取得）
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

  if (!facility) return null

  return (
    <div className="fixed top-4 right-4 w-96 max-h-[80vh] overflow-y-auto z-[1000] bg-white shadow-lg rounded-lg">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold">
            {facility.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* 座標情報の表示（Geosearch結果の場合） */}
          {facility.isGeoResult && (
            <div className="mb-4 p-2 bg-blue-50 rounded-md">
              <p className="text-xs text-blue-600">
                📍 座標: {facility.position[0].toFixed(4)}, {facility.position[1].toFixed(4)}
              </p>
              <p className="text-xs text-blue-600">
                🔍 地図範囲検索で発見
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          
          {error && (
            <div className="text-red-600 py-4">
              <p>エラー: {error}</p>
            </div>
          )}
          
          {wikipediaData && (
            <div className="space-y-4">
              {wikipediaData.thumbnail && (
                <img
                  src={wikipediaData.thumbnail.source}
                  alt={wikipediaData.title}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
              
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {wikipediaData.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {wikipediaData.extract}
                </p>
              </div>
              
              <div className="flex gap-2">
                {wikipediaData.content_urls && (
                  <Button
                    onClick={() => window.open(wikipediaData.content_urls.desktop.page, '_blank')}
                    className="flex-1"
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Wikipediaで詳細を見る
                  </Button>
                )}
                
                {isLoggedIn && (
                  <Button
                    onClick={handleEditClick}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    編集
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* ログインしていない場合でも基本情報を表示 */}
          {!wikipediaData && !loading && !error && facility && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {facility.name}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {facility.extract || 'この施設の詳細情報を取得中です...'}
                </p>
              </div>
              
              <Button
                onClick={() => window.open(`https://ja.wikipedia.org/wiki/${encodeURIComponent(facility.name)}`, '_blank')}
                className="w-full"
                variant="outline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Wikipediaで詳細を見る
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default WikipediaPanel

