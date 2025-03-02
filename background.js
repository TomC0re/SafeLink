const shortUrlDomains = new Set(['bit.ly', 'tinyurl.com', 'goo.gl', 'inlnk.ru', 'goo.su', 'clck.ru']); // Пример доменов коротких ссылок
let isPopupOpen = false; // Флаг для предотвращения бесконечного цикла

chrome.storage.sync.get(['shortUrlDomains'], function(result) {
  if (result.shortUrlDomains) {
    result.shortUrlDomains.forEach(domain => shortUrlDomains.add(domain));
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);

    // Проверяем, что это короткая ссылка
    if (
      shortUrlDomains.has(url.hostname) && // Домен в списке коротких ссылок
      url.pathname.length > 1 && // После домена есть "/" и хотя бы один символ
      !details.url.startsWith(chrome.runtime.getURL('')) && // Исключаем запросы к warning.html
      !url.pathname.match(/\.(css|js|woff|woff2|ttf|svg|png|jpg|jpeg|gif|ico)$/i) && // Исключаем ресурсы
      !url.pathname.includes('/frontend-api/') && // Исключаем запросы к API
      !isPopupOpen // Предотвращаем бесконечный цикл
    ) {
      isPopupOpen = true; // Устанавливаем флаг

      // Открываем новую вкладку с предупреждением рядом с текущей
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        chrome.tabs.create({
          url: chrome.runtime.getURL(`warning.html?url=${details.url}`), // Обновлено
          index: currentTab.index + 1 // Открываем вкладку следующей в списке
        });
      });
      return { cancel: true }; // Отменяем исходный запрос
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Сбрасываем флаг при закрытии вкладки с предупреждением
chrome.tabs.onRemoved.addListener(() => {
  isPopupOpen = false;
});