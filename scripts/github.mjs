/**
 * GitHub REST API helpers.
 * All functions throw on non-2xx responses.
 */

async function ghFetch(path, token, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub ${options.method ?? 'GET'} ${path} → ${res.status}: ${body}`)
  }
  return res.json()
}

/**
 * Create a new repo from a template repo.
 * Returns the new repo object { name, html_url, clone_url }.
 */
export async function createRepoFromTemplate(token, templateOwner, templateRepo, newName, description) {
  return ghFetch(`/repos/${templateOwner}/${templateRepo}/generate`, token, {
    method: 'POST',
    body: JSON.stringify({
      owner: templateOwner,
      name: newName,
      description,
      private: false,
      include_all_branches: false,
    }),
  })
}

/**
 * Update a single file in a repo via the Contents API.
 * content must be a plain string (will be base64-encoded).
 */
export async function upsertFile(token, owner, repo, filePath, content, message) {
  let sha
  try {
    const existing = await ghFetch(`/repos/${owner}/${repo}/contents/${filePath}`, token)
    sha = existing.sha
  } catch {
    // File doesn't exist yet — that's fine
  }

  return ghFetch(`/repos/${owner}/${repo}/contents/${filePath}`, token, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      ...(sha ? { sha } : {}),
    }),
  })
}

/**
 * Returns true if the repo name is available (does not exist) for the given owner.
 */
export async function isRepoNameAvailable(token, owner, name) {
  try {
    await ghFetch(`/repos/${owner}/${name}`, token)
    return false
  } catch (err) {
    if (err.message.includes('404')) return true
    throw err
  }
}
