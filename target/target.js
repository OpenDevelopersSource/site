(function () {
  var targetsBody = document.getElementById('targets-body');
  var emptyState = document.getElementById('target-empty');
  var roadmapTableWrap = document.querySelector('.roadmap-table-wrap');

  if (!targetsBody) return;

  var STATUS_LABELS = {
    'done': 'Done',
    'in-progress': 'In Progress',
    'planned': 'Planned',
    'stop': 'Stopped',
    'stopped': 'Stopped'
  };

  var STATUS_CLASSES = {
    'done': 'badge-success',
    'in-progress': 'badge-warning',
    'planned': '',
    'stop': 'badge-stopped',
    'stopped': 'badge-stopped'
  };

  function renderTargets(data) {
    targetsBody.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      if (roadmapTableWrap) {
        roadmapTableWrap.style.display = 'none';
      }
      if (emptyState) {
        emptyState.style.display = '';
      }
      return;
    }

    if (roadmapTableWrap) {
      roadmapTableWrap.style.display = '';
    }
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    data.forEach(function (entry) {
      var tr = document.createElement('tr');

      var nameTd = document.createElement('td');
      nameTd.className = 'component-name';
      nameTd.textContent = entry.name || 'Unknown';

      var descTd = document.createElement('td');
      descTd.className = 'component-desc';
      descTd.textContent = entry.description || '';

      var statusTd = document.createElement('td');
      var statusKey = (entry.status || 'planned').toLowerCase();
      var badge = document.createElement('span');
      badge.className = 'badge' + (STATUS_CLASSES[statusKey] ? ' ' + STATUS_CLASSES[statusKey] : '');
      badge.textContent = STATUS_LABELS[statusKey] || statusKey;
      statusTd.appendChild(badge);

      tr.appendChild(nameTd);
      tr.appendChild(descTd);
      tr.appendChild(statusTd);

      targetsBody.appendChild(tr);
    });
  }

  function loadTargets() {
    fetch('targets.json')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to load targets.json: ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        renderTargets(data);
      })
      .catch(function (error) {
        console.error('Error loading target data:', error);
        if (roadmapTableWrap) {
          roadmapTableWrap.style.display = 'none';
        }
        if (emptyState) {
          emptyState.style.display = '';
          emptyState.querySelector('p').textContent = 'Unable to load target data.';
        }
      });
  }

  loadTargets();
})();
