import React from 'react'
import { render, screen } from '@testing-library/react'
import Header from '@/components/layout/Header'

describe('Header', () => {
  test('renders top status items', () => {
    render(<Header />)
    expect(screen.getByText('Financely')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('1,240')).toBeInTheDocument()
  })
})
