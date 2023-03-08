module.exports = (elName) => {
  return `[
  {
    "hook": "hook-body-end",
    "content": "{% render '${elName}' %}"
  }
]`
}
