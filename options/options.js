document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(['shortUrlDomains'], function(result) {
    if (result.shortUrlDomains) {
      document.getElementById('domains').value = result.shortUrlDomains.join('\n');
    }
  });

  document.getElementById('save').addEventListener('click', () => {
    const domains = document.getElementById('domains').value.split('\n').map(domain => domain.trim()).filter(domain => domain);
    chrome.storage.sync.set({ shortUrlDomains: domains }, function() {
      alert('Домены сохранены!');
    });
  });
});