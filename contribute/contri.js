(function () {
  // ============================================================
  // CONFIGURATION — replace the placeholder values below
  // ============================================================
  var GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID';
  var GITHUB_REPO = 'ods2026m-boop/REPO_NAME_HERE';
  var GITHUB_REPO_ID = 'YOUR_REPO_ID';
  var GITHUB_CATEGORY = 'Contributors';
  var GITHUB_CATEGORY_ID = 'YOUR_CATEGORY_ID';
  var REDIRECT_URI = window.location.origin + '/api/oauth/callback';

  // ============================================================
  // DOM ELEMENTS
  // ============================================================
  var loginBtn = document.getElementById('login-btn');
  var logoutBtn = document.getElementById('logout-btn');
  var authSection = document.getElementById('auth-section');
  var userSection = document.getElementById('user-section');
  var chatSection = document.getElementById('chat-section');
  var userAvatar = document.getElementById('user-avatar');
  var userName = document.getElementById('user-name');
  var giscusContainer = document.getElementById('giscus-container');

  // ============================================================
  // OAUTH HELPERS
  // ============================================================
  function generateRandomString(length) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function getCookie(name) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf(name + '=') === 0) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }

  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
  }

  // ============================================================
  // OAUTH LOGIN
  // ============================================================
  function login() {
    var state = generateRandomString(16);
    setCookie('oauth_state', state, 1);

    var params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'read:user',
      state: state
    });

    window.location.href = 'https://github.com/login/oauth/authorize?' + params.toString();
  }

  // ============================================================
  // LOGOUT
  // ============================================================
  function logout() {
    sessionStorage.removeItem('github_token');
    sessionStorage.removeItem('github_user');
    authSection.style.display = '';
    userSection.style.display = 'none';
    chatSection.style.display = 'none';

    if (giscusContainer) {
      giscusContainer.innerHTML = '';
    }

    var giscusScript = document.querySelector('script[src*="giscus.app"]');
    if (giscusScript) {
      giscusScript.remove();
    }
  }

  // ============================================================
  // FETCH USER DATA
  // ============================================================
  function fetchGitHubUser(token) {
    return fetch('https://api.github.com/user', {
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json'
      }
    }).then(function (response) {
      if (!response.ok) {
        throw new Error('GitHub API request failed: ' + response.status);
      }
      return response.json();
    });
  }

  // ============================================================
  // SHOW USER UI
  // ============================================================
  function showUser(user) {
    authSection.style.display = 'none';
    userSection.style.display = '';
    chatSection.style.display = '';

    if (userAvatar) {
      userAvatar.src = user.avatar_url;
      userAvatar.alt = user.login;
    }
    if (userName) {
      userName.textContent = user.login;
    }
  }

  // ============================================================
  // INITIALIZE GISCUS
  // ============================================================
  function initGiscus() {
    if (!giscusContainer) return;

    giscusContainer.innerHTML = '';

    var script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', GITHUB_REPO);
    script.setAttribute('data-repo-id', GITHUB_REPO_ID);
    script.setAttribute('data-category', GITHUB_CATEGORY);
    script.setAttribute('data-category-id', GITHUB_CATEGORY_ID);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'dark');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    giscusContainer.appendChild(script);
  }

  // ============================================================
  // HANDLE OAUTH SUCCESS
  // ============================================================
  function handleLoginSuccess(token) {
    fetchGitHubUser(token)
      .then(function (user) {
        sessionStorage.setItem('github_token', token);
        sessionStorage.setItem('github_user', JSON.stringify(user));
        showUser(user);
        initGiscus();
      })
      .catch(function (error) {
        console.error('Error fetching GitHub user:', error);
        logout();
      });
  }

  // ============================================================
  // CHECK EXISTING SESSION
  // ============================================================
  function checkExistingSession() {
    var token = sessionStorage.getItem('github_token');
    var userJson = sessionStorage.getItem('github_user');

    if (token && userJson) {
      try {
        var user = JSON.parse(userJson);
        showUser(user);
        if (!document.querySelector('script[src*="giscus.app"]')) {
          initGiscus();
        }
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        logout();
      }
    } else if (token) {
      handleLoginSuccess(token);
    }
  }

  // ============================================================
  // INIT
  // ============================================================
  var urlParams = new URLSearchParams(window.location.search);
  var token = urlParams.get('token');

  if (token) {
    sessionStorage.setItem('github_token', token);
    window.history.replaceState({}, document.title, window.location.pathname);
    handleLoginSuccess(token);
  } else {
    checkExistingSession();
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', login);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
})();
