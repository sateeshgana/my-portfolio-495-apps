import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppCard } from './AppCard'
import type { AppEntry } from '../types'

const liveApp: AppEntry = {
  id: 'test-app',
  name: 'Test App',
  tagline: 'Does something useful',
  domain: 'productivity',
  status: 'live',
  url: 'https://test.netlify.app',
  github: 'https://github.com/test',
  tags: ['ai', 'tools'],
}

const soonApp: AppEntry = { ...liveApp, id: 'soon-app', status: 'coming-soon' }

describe('AppCard', () => {
  it('renders app name and tagline', () => {
    render(<AppCard app={liveApp} />)
    expect(screen.getByText('Test App')).toBeTruthy()
    expect(screen.getByText('Does something useful')).toBeTruthy()
  })

  it('shows LIVE badge for live apps', () => {
    render(<AppCard app={liveApp} />)
    expect(screen.getByText('LIVE')).toBeTruthy()
  })

  it('shows SOON badge for coming-soon apps', () => {
    render(<AppCard app={soonApp} />)
    expect(screen.getByText('SOON')).toBeTruthy()
  })

  it('renders open app link for live apps', () => {
    render(<AppCard app={liveApp} />)
    expect(screen.getByText('OPEN APP →')).toBeTruthy()
  })

  it('does not render open app link for coming-soon apps', () => {
    render(<AppCard app={soonApp} />)
    expect(screen.queryByText('OPEN APP →')).toBeNull()
  })
})
