/**
 * API Client wrapper to communicate with the Backend API Server
 */
const API_URL = window.BACKEND_API_URL || 'http://localhost:5000/api';

const apiClient = {
  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
      this.showToast(error.message || 'Network error, please try again.', 'danger');
      throw error;
    }
  },

  // Helper to show bootstrap alerts dynamically
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toastId = 'toast-' + Math.random().toString(36).substring(2, 9);
    const bgClass = `bg-${type}`;
    const textClass = type === 'warning' || type === 'light' ? 'text-dark' : 'text-white';

    const toastHTML = `
      <div id="${toastId}" class="toast align-items-center ${bgClass} ${textClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="4000">
        <div class="d-flex">
          <div class="toast-body">
            <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} me-2"></i>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHTML);
    const toastEl = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastEl);
    bsToast.show();

    // Remove from DOM after hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove();
    });
  },

  // Employees CRUD
  getAllEmployees(status = '') {
    return this.request(`/employees?status=${status}`);
  },
  
  getSingleEmployee(id) {
    return this.request(`/employees/${id}`);
  },
  
  saveEmployeeDetails(employeeData) {
    return this.request('/employees', {
      method: 'POST',
      body: employeeData
    });
  },
  
  updateEmployeeDetails(id, employeeData) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: employeeData
    });
  },

  // Categories CRUD
  getAllCategories() {
    return this.request('/categories');
  },
  
  addCategory(categoryData) {
    return this.request('/categories', {
      method: 'POST',
      body: categoryData
    });
  },
  
  editCategory(id, categoryData) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: categoryData
    });
  },

  // Assets CRUD
  getAllAssets(categoryId = '', search = '', includeScraped = false) {
    return this.request(`/assets?categoryId=${categoryId}&search=${search}&includeScraped=${includeScraped}`);
  },
  
  getInStockAssets() {
    return this.request('/assets/stock');
  },
  
  getBranchWiseStockStats() {
    return this.request('/assets/stats');
  },
  
  getSingleAssetDetails(id) {
    return this.request(`/assets/${id}`);
  },
  
  addNewAsset(assetData) {
    return this.request('/assets', {
      method: 'POST',
      body: assetData
    });
  },
  
  updateAssetDetails(id, assetData) {
    return this.request(`/assets/${id}`, {
      method: 'PUT',
      body: assetData
    });
  },

  // Asset Transactions
  allocateAssetToEmployee(allocationData) {
    return this.request('/transactions/issue', {
      method: 'POST',
      body: allocationData
    });
  },
  
  returnAssetToStock(returnData) {
    return this.request('/transactions/return', {
      method: 'POST',
      body: returnData
    });
  },
  
  scrapAssetObsolete(scrapData) {
    return this.request('/transactions/scrap', {
      method: 'POST',
      body: scrapData
    });
  },
  
  getAssetMovementHistory(assetId) {
    return this.request(`/transactions/history/${assetId}`);
  },
  
  getAllTransactionLogs() {
    return this.request('/transactions/logs');
  }
};
