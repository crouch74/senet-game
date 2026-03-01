import { describe, expect, it, vi } from 'vitest'
import { createMatchApi } from './matchApi'

describe('matchApi', () => {
  it('checks backend health from the REST endpoint', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true })
    const api = createMatchApi({ fetchFn })

    await expect(api.checkHealth()).resolves.toBe(true)
    expect(fetchFn).toHaveBeenCalledWith('/api/health', { signal: undefined })
  })

  it('creates rooms from a valid response payload', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ room_id: 'abc-def-ghi' }),
    })
    const api = createMatchApi({ fetchFn })

    await expect(api.createRoom()).resolves.toBe('abc-def-ghi')
    expect(fetchFn).toHaveBeenCalledWith('/api/match/create', {
      method: 'POST',
      signal: undefined,
    })
  })

  it('passes the selected game type when creating a mehen room', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ room_id: 'abc-def-ghi' }),
    })
    const api = createMatchApi({ fetchFn })

    await expect(api.createRoom('mehen')).resolves.toBe('abc-def-ghi')
    expect(fetchFn).toHaveBeenCalledWith('/api/match/create?game=mehen', {
      method: 'POST',
      signal: undefined,
    })
  })

  it('passes the selected game type when creating an Ur room', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ room_id: 'abc-def-ghi' }),
    })
    const api = createMatchApi({ fetchFn })

    await expect(api.createRoom('ur')).resolves.toBe('abc-def-ghi')
    expect(fetchFn).toHaveBeenCalledWith('/api/match/create?game=ur', {
      method: 'POST',
      signal: undefined,
    })
  })

  it('throws when create-room responds with a non-ok status', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Server Error',
    })
    const api = createMatchApi({ fetchFn })

    await expect(api.createRoom()).rejects.toThrow('Server Error')
  })

  it('throws when create-room returns an invalid payload shape', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: true }),
    })
    const api = createMatchApi({ fetchFn })

    await expect(api.createRoom()).rejects.toThrow('Invalid create-room response')
  })
})
