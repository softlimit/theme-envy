module.exports = (tag, extName) => {
  return `<!-- softlimit { "action": "partial", "file": "section-spacing-y" } -->
<${tag} class="{{ sectionSpacingY }} {{ section.settings.custom_classes }}"{{ sectionColorStyle }}>
  <div class="{% unless section.settings.full_width %}page-width {% endunless %}">
    
  </div>
</${tag}>
{% schema 'schema-${extName}.js' %}
`
}
