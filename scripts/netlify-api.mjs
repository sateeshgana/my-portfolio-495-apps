/**
 * Netlify REST API helpers.
 */

async function ntFetch(path, token, options = {}) {
  const res = await fetch(`https://api.netlify.com/api/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Netlify ${options.method ?? 'GET'} ${path} → ${res.status}: ${body}`)
  }
  return res.json()
}

/**
 * Create a Netlify site linked to a GitHub repo.
 */
export async function createSite(token, repoOwner, repoName, siteName) {
  return ntFetch('/sites', token, {
    method: 'POST',
    body: JSON.stringify({
      name: siteName,
      repo: {
        provider: 'github',
        repo: `${repoOwner}/${repoName}`,
        branch: 'main',
        cmd: 'npm run build',
        dir: 'dist',
        private: false,
      },
    }),
  })
}

/**
 * Set multiple environment variables on a Netlify site using the new env vars API.
 * envVars is an object: { KEY: 'value', KEY2: 'value2' }
 * accountId comes from the site object returned by createSite (site.account_id or site.account_slug).
 */
export async function setSiteEnvVars(token, accountId, siteId, envVars) {
  const body = Object.entries(envVars).map(([key, value]) => ({
    key,
    is_secret: false,
    values: [{ value, context: 'all' }],
  }))
  return ntFetch(`/accounts/${accountId}/env?site_id=${siteId}`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * Trigger a new deploy for a site.
 */
export async function triggerDeploy(token, siteId) {
  return ntFetch(`/sites/${siteId}/deploys`, token, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

/**
 * Poll until the latest deploy reaches 'ready' or 'error'.
 * Times out after timeoutMs (default 3 minutes).
 */
export async function waitForDeploy(token, siteId, timeoutMs = 180_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    await new Promise(r => setTimeout(r, 8_000))
    const deploys = await ntFetch(`/sites/${siteId}/deploys?per_page=1`, token)
    const latest = deploys[0]
    if (!latest) continue
    if (latest.state === 'ready') return latest
    if (latest.state === 'error') throw new Error(`Deploy failed: ${latest.error_message ?? 'unknown'}`)
  }
  throw new Error('Deploy timed out after 3 minutes')
}
