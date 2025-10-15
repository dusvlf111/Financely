import React from 'react'
import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/login/page'

describe('Login page', () => {
  test('renders three social login buttons', () => {
    render(<LoginPage />)
    expect(screen.getByText('구글로 로그인')).toBeInTheDocument()
    expect(screen.getByText('네이버로 로그인')).toBeInTheDocument()
    expect(screen.getByText('카카오로 로그인')).toBeInTheDocument()
  })
})
