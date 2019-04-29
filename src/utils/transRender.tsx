import * as React from 'react'

export const null2Bar = (_?, record?) => (
  <span>{_ || '--'}</span>
)

export const FormatNumber = (_: string, record?) => (
  !isNaN(Number(_)) && Number(_) >= 10 ? _ : `0${_}`
)