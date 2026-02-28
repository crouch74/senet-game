import { useSenetStore } from '../engine/store'
import {
  localTurnStateSelector,
  useShallowSelector,
} from '../engine/selectors'
import { isLocalTurnState, type LocalTurnState } from '../engine/storeHelpers'

export const getIsLocalTurn = (state: LocalTurnState) => isLocalTurnState(state)

export function useLocalTurn() {
  const localTurnState = useSenetStore(
    useShallowSelector(localTurnStateSelector),
  )

  return getIsLocalTurn(localTurnState)
}
