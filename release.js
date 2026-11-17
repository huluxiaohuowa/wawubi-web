(() => {
  const button = document.querySelector('#download-release');
  if (!button) return;

  const repository = 'huluxiaohuowa/wa-wubi';
  const releasesAPI = 'https://api.github.com/repos/' + repository + '/releases?per_page=20';
  const downloadBase = 'https://github.com/' + repository + '/releases/download/';

  function parseVersion(version) {
    if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) return null;
    const parts = version.split('.').map(Number);
    return parts.every(Number.isSafeInteger) ? parts : null;
  }

  function isNewer(candidate, baseline) {
    return (candidate[0] - baseline[0] || candidate[1] - baseline[1] || candidate[2] - baseline[2]) > 0;
  }

  async function refresh() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(releasesAPI, {
        signal: controller.signal,
        credentials: 'omit',
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!response.ok) return;
      const releases = await response.json();
      if (!Array.isArray(releases)) return;

      let newest = null;
      let baseline = parseVersion(button.dataset.version) ?? [0, 0, 0];
      for (const release of releases) {
        const tag = release?.tag_name;
        if (release?.draft || typeof tag !== 'string' || !tag.startsWith('v')) continue;
        const version = tag.slice(1);
        const parts = parseVersion(version);
        if (!parts || !isNewer(parts, baseline) || !Array.isArray(release.assets)) continue;

        const file = 'WA-Wubi-' + version + '.dmg';
        const url = downloadBase + tag + '/' + file;
        if (!release.assets.some(asset => asset?.name === file &&
          asset.state === 'uploaded' && asset.size > 0 && asset.browser_download_url === url)) continue;

        newest = { url, version, preview: release.prerelease };
        baseline = parts;
      }
      if (newest) {
        button.href = newest.url;
        button.dataset.version = newest.version;
        button.textContent = '下载 ' + newest.version + (newest.preview ? ' 预览版' : '');
      }
    } catch {
      // The page already has a verified installer link.
    } finally {
      clearTimeout(timer);
    }
  }

  void refresh();
})();
