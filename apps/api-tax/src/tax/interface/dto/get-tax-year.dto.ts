import type { WithYear } from '@domain/types/with-year.type'

export class GetTaxYearDto implements WithYear {
  year!: number
}
