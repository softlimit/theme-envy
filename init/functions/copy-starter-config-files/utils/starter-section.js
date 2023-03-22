/**
 * @file Used as a template for a new section file for a new feature or element
 * @param {string} extName - The name of the feature or element
 * @param {string} tag - The tag name of the feature or element, e.g. 'section', 'div', or 'custom-element'
 */

module.exports = (tag, extName) => {
  return `<!-- softlimit { "action": "partial", "file": "section-spacing-y" } -->
<${tag} class="{{ sectionSpacingY }} {{ section.settings.custom_classes }}"{{ sectionColorStyle }}>
  <div class="{% unless section.settings.full_width %}page-width {% endunless %}">
    
  </div>
</${tag}>
{% schema 'schema-${extName}.js' %}
`
}
