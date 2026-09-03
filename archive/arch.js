(function () {
  // CONFIG: URL to the archive JSON file. Relative path works when the JSON
  // is hosted alongside this page (same site). Change to absolute URL if needed.
  const ARCHIVE_URL = "archive.json";

  const searchInput = document.getElementById('search');
  const packageList = document.getElementById('package-list');
  const resultCount = document.getElementById('result-count');
  const emptyState = document.getElementById('archive-empty');

  if (!packageList) return;

  function renderEmpty(message) {
    packageList.innerHTML = '';
    packageList.style.display = 'none';
    if (emptyState) {
      emptyState.style.display = '';
      emptyState.querySelector('p').textContent = message;
    }
  }

  function renderPackages(packages) {
    packageList.innerHTML = '';

    if (!Array.isArray(packages) || packages.length === 0) {
      renderEmpty('No packages published yet.');
      if (resultCount) resultCount.textContent = '0 packages';
      return;
    }

    packages.forEach(function (pkg) {
      const row = document.createElement('div');
      row.className = 'package-row';
      row.setAttribute('data-name', pkg.name || '');
      row.setAttribute('data-version', pkg.version || '');

      const nameCol = document.createElement('div');
      nameCol.className = 'package-name';
      nameCol.textContent = pkg.name || 'Unknown';

      const versionCol = document.createElement('div');
      versionCol.className = 'package-version';
      versionCol.textContent = pkg.version || '';

      const linkCol = document.createElement('div');
      linkCol.className = 'package-link';
      const link = document.createElement('a');
      link.href = pkg.download_url || '#';
      link.textContent = 'Download';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      linkCol.appendChild(link);

      row.appendChild(nameCol);
      row.appendChild(versionCol);
      row.appendChild(linkCol);
      packageList.appendChild(row);
    });

    if (emptyState) emptyState.style.display = 'none';
    packageList.style.display = '';

    if (searchInput) filterPackages();
  }

  function filterPackages() {
    const rows = Array.from(packageList.querySelectorAll('.package-row'));
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    let visibleCount = 0;

    rows.forEach(function (row) {
      const name = row.getAttribute('data-name') || '';
      const version = row.getAttribute('data-version') || '';
      const text = (name + ' ' + version).toLowerCase();
      const match = text.indexOf(query) !== -1;
      row.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    if (resultCount) {
      resultCount.textContent = visibleCount + ' package' + (visibleCount === 1 ? '' : 's');
    }

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? '' : 'none';
      if (visibleCount === 0) {
        emptyState.querySelector('p').textContent = 'No packages match your search.';
      }
    }

    packageList.style.display = visibleCount === 0 ? 'none' : '';
  }

  function loadArchive() {
    if (searchInput) searchInput.disabled = false;

    fetch(ARCHIVE_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) {
          throw new Error('Invalid archive format');
        }
        renderPackages(data);
      })
      .catch(function (error) {
        console.error('Failed to load archive:', error);
        renderEmpty('Unable to load package archive. Please try again later.');
        if (resultCount) resultCount.textContent = '0 packages';
      });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterPackages);
  }

  loadArchive();
})();
