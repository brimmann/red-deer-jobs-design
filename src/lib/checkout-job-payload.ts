export type CheckoutJobPayload = {
  title: string
  company: string
  addressLine: string
  employmentSetup: string[]
  payAmountMin: string
  payAmountMax: string
  payPreset: string | null
  description: string
  applyTo: string
  employerEmail: string
}
