
if (window.location.href.search('account') > -1) {
  import(
    /* webpackChunkName: "account-styles",
      webpackInclude: /\.css$/
      */
    'Features/customers/styles/customers.css'
  )
}
