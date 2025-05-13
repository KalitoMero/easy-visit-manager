
const Store = require('electron-store');

// Initialize stores for app settings
const printerStore = new Store({ name: 'printer-settings' });
const visitorStore = new Store({ name: 'visitor-storage' });
const policyStore = new Store({ name: 'policy-storage' });
const adminStore = new Store({ name: 'admin-auth-storage' });
const languageStore = new Store({ name: 'language-storage' });

// Export all stores
module.exports = {
  printerStore,
  visitorStore,
  policyStore,
  adminStore,
  languageStore,
  
  // Helper function to get store data by name
  getStoreByName(storeName) {
    switch (storeName) {
      case 'printer-settings':
        return this.printerStore;
      case 'visitor-storage':
        return this.visitorStore;
      case 'policy-storage':
        return this.policyStore;
      case 'admin-auth-storage':
        return this.adminStore;
      case 'language-storage':
        return this.languageStore;
      default:
        return null;
    }
  }
};
