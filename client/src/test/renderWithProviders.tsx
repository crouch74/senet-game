import type { PropsWithChildren, ReactElement } from 'react'
import { render } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'

interface RenderOptions {
  language?: string
}

export async function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {},
) {
  const language = options.language ?? 'en'
  await i18n.changeLanguage(language)

  return render(ui, {
    wrapper: ({ children }: PropsWithChildren) => (
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    ),
  })
}
