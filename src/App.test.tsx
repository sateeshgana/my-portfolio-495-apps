import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  async function openPortfolio(user: ReturnType<typeof userEvent.setup>) {
    const btns = screen.getAllByRole('button', { name: /AI Portfolio/i })
    await user.click(btns[0])
  }

  it('shows the career page by default', () => {
    render(<App />)
    // Career page has a heading with Sateesh
    expect(screen.getAllByText('Sateesh')[0]).toBeInTheDocument()
  })

  describe('PortfolioPage', () => {
    it('renders hero heading AI App and Portfolio', async () => {
      const user = userEvent.setup()
      render(<App />)
      await openPortfolio(user)

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1.textContent).toContain('AI App')
      expect(h1.textContent).toContain('Portfolio')
    })

    it('renders the All domain tab', async () => {
      const user = userEvent.setup()
      render(<App />)
      await openPortfolio(user)

      expect(screen.getByRole('button', { name: /^All/i })).toBeInTheDocument()
    })

    it('filters to live apps only when Live Only is toggled', async () => {
      const user = userEvent.setup()
      render(<App />)
      await openPortfolio(user)

      const liveOnlyBtn = screen.getByRole('button', { name: /Live Only/i })
      await user.click(liveOnlyBtn)

      // All visible articles should not show "SOON" status
      const articles = screen.getAllByRole('article')
      for (const article of articles) {
        expect(article.textContent).not.toMatch(/\bSOON\b/)
      }
    })

    it('filters apps by name search', async () => {
      const user = userEvent.setup()
      render(<App />)
      await openPortfolio(user)

      const searchInput = screen.getByRole('searchbox', { name: /Search apps/i })
      await user.type(searchInput, 'PromptLab')

      const headings = screen.getAllByRole('heading', { level: 3 })
      const names = headings.map((h) => h.textContent)
      expect(names.some((n) => n?.includes('PromptLab'))).toBe(true)
      expect(names.every((n) => n?.toLowerCase().includes('promptlab'))).toBe(true)
    })
  })
})
