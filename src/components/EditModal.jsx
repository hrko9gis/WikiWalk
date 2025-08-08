import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Info } from 'lucide-react';

const EditModal = ({ isOpen, onClose, article, onSave }) => {
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [originalContent, setOriginalContent] = useState('');

  useEffect(() => {
    if (isOpen && article) {
      // 記事の現在の内容を取得
      fetchArticleContent();
    }
  }, [isOpen, article]);

  const fetchArticleContent = async () => {
    if (!article?.title) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://ja.wikipedia.org/w/api.php?` +
        `action=query&format=json&origin=*&prop=revisions&rvprop=content&titles=${encodeURIComponent(article.title)}`
      );
      const data = await response.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pages[pageId].revisions) {
        const wikitext = pages[pageId].revisions[0]['*'];
        setContent(wikitext);
        setOriginalContent(wikitext);
      }
    } catch (err) {
      setError('記事の内容を取得できませんでした');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setError('内容を入力してください');
      return;
    }

    if (!summary.trim()) {
      setError('編集要約を入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave({
        title: article.title,
        content: content,
        summary: summary
      });
      onClose();
    } catch (err) {
      setError(err.message || '保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setSummary('');
    setError('');
    onClose();
  };

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100]">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            記事を編集: {article.title}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start">
          <Info size={16} className="text-yellow-600 mr-2 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p><strong>重要:</strong> Wikipediaの編集は慎重に行ってください。</p>
            <p>・中立的な観点を保つ</p>
            <p>・信頼できる情報源を使用する</p>
            <p>・編集要約を必ず記入する</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              記事内容（Wikitext形式）
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="記事の内容をWikitext形式で入力してください..."
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              編集要約 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="この編集の理由を簡潔に説明してください"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center">
              <AlertCircle size={16} className="text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            disabled={isLoading || !content.trim() || !summary.trim()}
          >
            <Save size={16} className="mr-2" />
            {isLoading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;

