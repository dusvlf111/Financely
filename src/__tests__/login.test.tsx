import React from 'react'
import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/login/page'

describe('Login page', () => {
  test('renders three social login buttons', () => {
    render(<LoginPage />)
    const google = screen.getByRole('button', { name: '구글로 로그인' })
    const naver = screen.getByRole('button', { name: '네이버로 로그인' })
    const kakao = screen.getByRole('button', { name: '카카오로 로그인' })
    expect(google).toBeInTheDocument()
    expect(naver).toBeInTheDocument()
    expect(kakao).toBeInTheDocument()
  })
})
