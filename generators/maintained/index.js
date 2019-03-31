const Generator = require('../util/base');

module.exports = class Maintained extends Generator {
  async writing() {
    const year = new Date().getFullYear();
    const imageUrl = `https://img.shields.io/maintenance/yes/${year}.svg`;

    await this.addReadmeBadge({
      name: 'maint',
      altText: `Maintenance status as of ${year}`,
      imageUrl,
      priority: 100,
    });
  }
};
