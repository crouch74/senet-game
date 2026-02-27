import { beforeEach } from 'vitest'
import { useSenetStore } from '../engine/store'

export function registerSenetStoreReset() {
  const initialState = useSenetStore.getInitialState()

  beforeEach(() => {
    useSenetStore.setState(initialState, true)
  })
}
