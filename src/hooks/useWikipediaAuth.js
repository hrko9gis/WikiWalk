import { useState, useCallback } from 'react';

const useWikipediaAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [session, setSession] = useState(null);

  const login = useCallback(async (inputUsername, password) => {
    try {
      // セッションを作成
      const sessionObj = {
        cookies: new Map(),
        username: inputUsername
      };

      const API_URL = 'https://ja.wikipedia.org/w/api.php';

      // Step 1: ログイントークンを取得
      const tokenResponse = await fetch(
        `${API_URL}?action=query&meta=tokens&type=login&format=json&origin=*`
      );
      const tokenData = await tokenResponse.json();
      const loginToken = tokenData.query.tokens.logintoken;

      // Step 2: ログイン試行
      const loginFormData = new FormData();
      loginFormData.append('action', 'login');
      loginFormData.append('lgname', inputUsername);
      loginFormData.append('lgpassword', password);
      loginFormData.append('lgtoken', loginToken);
      loginFormData.append('format', 'json');

      const loginResponse = await fetch(API_URL, {
        method: 'POST',
        body: loginFormData,
        credentials: 'include'
      });

      const loginData = await loginResponse.json();

      if (loginData.login.result === 'Success') {
        setIsLoggedIn(true);
        setUsername(inputUsername);
        setSession(sessionObj);
        return { success: true };
      } else {
        throw new Error(loginData.login.reason || 'ログインに失敗しました');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUsername('');
    setSession(null);
  }, []);

  const editArticle = useCallback(async ({ title, content, summary }) => {
    if (!isLoggedIn) {
      throw new Error('ログインが必要です');
    }

    try {
      const API_URL = 'https://ja.wikipedia.org/w/api.php';

      // Step 1: CSRFトークンを取得
      const tokenResponse = await fetch(
        `${API_URL}?action=query&meta=tokens&type=csrf&format=json&origin=*`,
        { credentials: 'include' }
      );
      const tokenData = await tokenResponse.json();
      const csrfToken = tokenData.query.tokens.csrftoken;

      // Step 2: 記事を編集
      const editFormData = new FormData();
      editFormData.append('action', 'edit');
      editFormData.append('title', title);
      editFormData.append('text', content);
      editFormData.append('summary', summary);
      editFormData.append('token', csrfToken);
      editFormData.append('format', 'json');

      const editResponse = await fetch(API_URL, {
        method: 'POST',
        body: editFormData,
        credentials: 'include'
      });

      const editData = await editResponse.json();

      if (editData.edit && editData.edit.result === 'Success') {
        return { success: true, data: editData.edit };
      } else {
        throw new Error(editData.error?.info || '編集に失敗しました');
      }
    } catch (error) {
      console.error('Edit error:', error);
      throw error;
    }
  }, [isLoggedIn]);

  return {
    isLoggedIn,
    username,
    login,
    logout,
    editArticle
  };
};

export default useWikipediaAuth;

