const slug = require('slug')

const slugify = (title) => {
  return slug(title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
}

module.exports = slugify
