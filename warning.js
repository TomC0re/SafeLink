document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const shortUrl = params.get('url');

  if (shortUrl) {
    document.getElementById('shortUrl').textContent = `Короткая ссылка: ${shortUrl}`;

    // Функция для декодирования ссылки через unshorten.me
    const decodeWithUnshortenMe = () => {
      return fetch(`https://unshorten.me/json/${encodeURIComponent(shortUrl)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Не удалось декодировать ссылку через unshorten.me');
          }
          return response.json();
        })
        .then(data => {
          if (data.resolved_url) {
            return data.resolved_url; // Возвращаем декодированную ссылку
          } else {
            throw new Error('Не удалось декодировать ссылку через unshorten.me');
          }
        });
    };

    // Функция для декодирования ссылки через unshorten.it
    const decodeWithUnshortenIt = () => {
      return fetch(`https://unshorten.it/api/v2/unshorten?url=${encodeURIComponent(shortUrl)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Не удалось декодировать ссылку через unshorten.it');
          }
          return response.json();
        })
        .then(data => {
          if (data.resolved_url) {
            return data.resolved_url; // Возвращаем декодированную ссылку
          } else {
            throw new Error('Не удалось декодировать ссылку через unshorten.it');
          }
        });
    };

    // Функция для декодирования ссылки через fetch с перенаправлением
    const decodeWithFetch = () => {
      return fetch(shortUrl, { method: 'HEAD', redirect: 'follow' })
        .then(response => {
          if (response.url) {
            return response.url; // Возвращаем декодированную ссылку
          } else {
            throw new Error('Не удалось декодировать ссылку через fetch');
          }
        });
    };

    // Функция для декодирования ссылки через XMLHttpRequest
    const decodeWithXHR = () => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', shortUrl, true);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseURL); // Возвращаем декодированную ссылку
          } else {
            reject(new Error('Не удалось декодировать ссылку через XMLHttpRequest'));
          }
        };
        xhr.onerror = () => {
          reject(new Error('Ошибка сети при декодировании ссылки через XMLHttpRequest'));
        };
        xhr.send();
      });
    };

    // Пытаемся декодировать ссылку через unshorten.me
    decodeWithUnshortenMe()
      .then(decodedUrl => {
        document.getElementById('decodedUrl').textContent = `Декодированная ссылка: ${decodedUrl}`;

        // Обработка кнопки "Перейти"
        const goButton = document.getElementById('go');
        goButton.addEventListener('click', () => {
          // Открываем декодированную ссылку в новой вкладке
          window.open(decodedUrl, '_blank');
          window.close(); // Закрываем вкладку с предупреждением
        });
      })
      .catch(error => {
        console.error('Ошибка декодирования через unshorten.me:', error);

        // Если unshorten.me не сработал, пробуем unshorten.it
        decodeWithUnshortenIt()
          .then(decodedUrl => {
            document.getElementById('decodedUrl').textContent = `Декодированная ссылка: ${decodedUrl}`;

            // Обработка кнопки "Перейти"
            const goButton = document.getElementById('go');
            goButton.addEventListener('click', () => {
              // Открываем декодированную ссылку в новой вкладке
              window.open(decodedUrl, '_blank');
              window.close(); // Закрываем вкладку с предупреждением
            });
          })
          .catch(error => {
            console.error('Ошибка декодирования через unshorten.it:', error);

            // Если unshorten.it не сработал, пробуем fetch с перенаправлением
            decodeWithFetch()
              .then(decodedUrl => {
                document.getElementById('decodedUrl').textContent = `Декодированная ссылка: ${decodedUrl}`;

                // Обработка кнопки "Перейти"
                const goButton = document.getElementById('go');
                goButton.addEventListener('click', () => {
                  // Открываем декодированную ссылку в новой вкладке
                  window.open(decodedUrl, '_blank');
                  window.close(); // Закрываем вкладку с предупреждением
                });
              })
              .catch(error => {
                console.error('Ошибка декодирования через fetch:', error);

                // Если fetch не сработал, пробуем XMLHttpRequest
                decodeWithXHR()
                  .then(decodedUrl => {
                    document.getElementById('decodedUrl').textContent = `Декодированная ссылка: ${decodedUrl}`;

                    // Обработка кнопки "Перейти"
                    const goButton = document.getElementById('go');
                    goButton.addEventListener('click', () => {
                      // Открываем декодированную ссылку в новой вкладке
                      window.open(decodedUrl, '_blank');
                      window.close(); // Закрываем вкладку с предупреждением
                    });
                  })
                  .catch(error => {
                    console.error('Ошибка декодирования через XMLHttpRequest:', error);
                    document.getElementById('decodedUrl').textContent = 'Не удалось декодировать ссылку.';
                  });
              });
          });
      });

    // Обработка кнопки "Отказаться"
    document.getElementById('cancel').addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTabId = tabs[0].id;
        chrome.tabs.goBack(currentTabId, () => {
          window.close(); // Закрываем вкладку с предупреждением
        });
      });
    });
  } else {
    document.getElementById('shortUrl').textContent = 'Ссылка не предоставлена.';
  }
});