module.exports = {
  name: 'Login',
  settings: [
    {
      type: 'text',
      id: 'subheading',
      label: 'Subheading'
    },
    {
      type: 'image_picker',
      id: 'image',
      label: 'Image'
    },
    {
      type: 'textarea',
      id: 'new_customer_message',
      label: 'New Customer Message',
      default: 'New Customer?'
    }
  ]
}
