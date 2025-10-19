import { useState, useCallback } from 'react'

const useGeosearch = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchNearby = useCallback(async (lat, lon, radius = 10000, limit = 50) => {
    setLoading(true)
    setError(null)
    
    try {
      // Wikipedia Geosearch APIを使用して近くの記事を検索
      // radiusの範囲を制限（10m〜10000m）
      const validRadius = Math.round(Math.max(10, Math.min(radius, 10000)))
      
      const response = await fetch(
        `https://ja.wikipedia.org/w/api.php?` +
        `action=query&` +
        `list=geosearch&` +
        `gscoord=${lat}|${lon}&` +
        `gsradius=${validRadius}&` +
        `gslimit=${limit}&` +
        `format=json&` +
        `origin=*`
      )
      
      if (!response.ok) {
        throw new Error('検索に失敗しました')
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.info || '検索エラーが発生しました')
      }
      
      const results = data.query?.geosearch || []
      
      // 各記事の詳細情報を取得
      const articlesWithDetails = await Promise.all(
        results.map(async (article) => {
          try {
            const detailResponse = await fetch(
              `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article.title)}`
            )
            
            if (detailResponse.ok) {
              const detailData = await detailResponse.json()
              return {
                ...article,
                extract: detailData.extract,
                thumbnail: detailData.thumbnail,
                content_urls: detailData.content_urls
              }
            }
            
            return article
          } catch (err) {
            console.warn(`Failed to fetch details for ${article.title}:`, err)
            return article
          }
        })
      )
      
      return articlesWithDetails
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { searchNearby, loading, error }
}

export default useGeosearch

