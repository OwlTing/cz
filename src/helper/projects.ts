interface Project {
  name: string
  prefix: string
  value: string
}

export default <Project[]>[
  {
    name: 'OwlPay',
    prefix: 'OWLPAY',
    value: 'owlpay'
  },
  {
    name: 'OwlNest',
    prefix: 'OW',
    value: 'owlnest'
  },
  {
    name: 'Market',
    prefix: 'MAR',
    value: 'market'
  },
  {
    name: 'PayNow',
    prefix: 'PN',
    value: 'paynow'
  },
  {
    name: 'Wallet Pro',
    prefix: 'WP',
    value: 'wallet-pro'
  }
]