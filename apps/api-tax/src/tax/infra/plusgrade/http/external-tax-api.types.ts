import type { AxiosRequestConfig } from 'axios'

import type { TaxBracket } from '@domain/types/tax-bracket.type'
import type { WithYear } from '@domain/types/with-year.type'

export const TAX_CONTEXT_KEY = 'taxContext'

export type TaxRequestConfig = AxiosRequestConfig & {
  [TAX_CONTEXT_KEY]?: WithYear
}

export type ExternalTaxBracket = Pick<TaxBracket, 'min' | 'rate'> & {
  max?: number
}

export type ExternalTaxBracketsResponse = {
  tax_brackets?: ExternalTaxBracket[]
}
