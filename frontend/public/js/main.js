/**
 * Main application JS logic for UI rendering and API consumption
 */

$(document).ready(function () {
  // Sidebar Toggle Click Handler
  $("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
  });

  // Helper: Format currency
  function formatCurrency(val) {
    const num = parseFloat(val);
    if (isNaN(num)) return '₹0.00';
    return '₹' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  // Helper: Format Date
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Helper: Format DateTime
  function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Set default date picker values to Today
  $('input[type="date"]').val(new Date().toISOString().substring(0, 10));

  // ==========================================
  // PAGE 1: STOCK VIEW / DASHBOARD
  // ==========================================
  if ($('#stock-details-table').length > 0) {
    // Initialize DataTable
    const stockTable = $('#stock-details-table').DataTable({
      columns: [
        { data: 'assetCode' },
        { data: 'serialNumber' },
        { data: 'category.name' },
        { 
          data: null,
          render: function(data) {
            return `<span class="fw-semibold">${data.make}</span> <span class="text-muted">${data.model}</span>`;
          }
        },
        { 
          data: 'value',
          className: 'text-end',
          render: function(val) { return formatCurrency(val); }
        },
        { data: 'branch' }
      ]
    });

    // Fetch Stats
    apiClient.getBranchWiseStockStats().then(stats => {
      $('#stat-total-count').text(stats.grandTotal.count);
      $('#stat-total-value').text(formatCurrency(stats.grandTotal.value));

      // Build branch summary table
      const tbody = $('#branch-summary-table tbody');
      tbody.empty();

      if (stats.branchTotals.length === 0) {
        tbody.append('<tr><td colspan="3" class="text-center text-muted">No stock available in branches</td></tr>');
      } else {
        stats.branchTotals.forEach(branch => {
          tbody.append(`
            <tr>
              <td><i class="fa-solid fa-building-user text-muted me-2"></i>${branch.branch}</td>
              <td class="text-center fw-bold">${branch.count}</td>
              <td class="text-end fw-semibold">${formatCurrency(branch.value)}</td>
            </tr>
          `);
        });
      }

      $('#summary-grand-count').text(stats.grandTotal.count);
      $('#summary-grand-value').text(formatCurrency(stats.grandTotal.value));
    });

    // Fetch stock items
    apiClient.getInStockAssets().then(assets => {
      stockTable.clear().rows.add(assets).draw();
    });
  }

  // ==========================================
  // PAGE 2: EMPLOYEE MASTER
  // ==========================================
  if ($('#employees-table').length > 0) {
    const employeeTable = $('#employees-table').DataTable({
      columns: [
        { data: 'employeeCode' },
        { data: 'name', className: 'fw-bold' },
        { data: 'email' },
        { data: 'branch' },
        { 
          data: 'status',
          render: function(status) {
            const badgeClass = status === 'Active' ? 'badge-active' : 'badge-inactive';
            return `<span class="badge-status ${badgeClass}">${status}</span>`;
          }
        },
        {
          data: null,
          className: 'text-center',
          orderable: false,
          render: function(data) {
            return `
              <button class="btn btn-sm btn-outline-warning edit-employee-btn" data-id="${data.id}" title="Edit Employee">
                <i class="fa-solid fa-user-pen"></i> Edit
              </button>
            `;
          }
        }
      ]
    });

    function loadEmployees() {
      const status = $('#employee-status-filter').val();
      apiClient.getAllEmployees(status).then(employees => {
        employeeTable.clear().rows.add(employees).draw();
      });
    }

    // Trigger loading
    loadEmployees();

    // Filter change handler
    $('#employee-status-filter').change(loadEmployees);

    // Form submit: Add Employee
    $('#add-employee-form').on('submit', function (e) {
      e.preventDefault();
      const data = {
        employeeCode: $('#add-employee-code').val().trim() || undefined,
        name: $('#add-name').val().trim(),
        email: $('#add-email').val().trim(),
        branch: $('#add-branch').val(),
        status: $('#add-status').val()
      };

      apiClient.saveEmployeeDetails(data).then(res => {
        apiClient.showToast('Employee successfully saved!');
        $('#addEmployeeModal').modal('hide');
        $('#add-employee-form')[0].reset();
        loadEmployees();
      });
    });

    // Edit button click
    $('#employees-table').on('click', '.edit-employee-btn', function () {
      const id = $(this).data('id');
      apiClient.getSingleEmployee(id).then(emp => {
        $('#edit-id').val(emp.id);
        $('#edit-employee-code').val(emp.employeeCode);
        $('#edit-name').val(emp.name);
        $('#edit-email').val(emp.email);
        $('#edit-branch').val(emp.branch);
        $('#edit-status').val(emp.status);
        $('#editEmployeeModal').modal('show');
      });
    });

    // Form submit: Edit Employee
    $('#edit-employee-form').on('submit', function (e) {
      e.preventDefault();
      const id = $('#edit-id').val();
      const data = {
        name: $('#edit-name').val().trim(),
        email: $('#edit-email').val().trim(),
        branch: $('#edit-branch').val(),
        status: $('#edit-status').val()
      };

      apiClient.updateEmployeeDetails(id, data).then(res => {
        apiClient.showToast('Employee details updated!');
        $('#editEmployeeModal').modal('hide');
        loadEmployees();
      });
    });
  }

  // ==========================================
  // PAGE 3: CATEGORY MASTER
  // ==========================================
  if ($('#categories-table').length > 0) {
    const catTable = $('#categories-table').DataTable({
      columns: [
        { data: 'id' },
        { data: 'name', className: 'fw-bold' },
        { data: 'description', defaultContent: '<span class="text-muted">No description</span>' },
        {
          data: null,
          className: 'text-center',
          orderable: false,
          render: function(data) {
            return `
              <button class="btn btn-sm btn-outline-warning edit-cat-btn" data-id="${data.id}" title="Edit Category">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
            `;
          }
        }
      ]
    });

    function loadCategories() {
      apiClient.getAllCategories().then(categories => {
        catTable.clear().rows.add(categories).draw();
      });
    }

    loadCategories();

    // Form submit: Add Category
    $('#add-category-form').on('submit', function (e) {
      e.preventDefault();
      const data = {
        name: $('#add-category-name').val().trim(),
        description: $('#add-category-desc').val().trim() || undefined
      };

      apiClient.addCategory(data).then(res => {
        apiClient.showToast('Category successfully created!');
        $('#addCategoryModal').modal('hide');
        $('#add-category-form')[0].reset();
        loadCategories();
      });
    });

    // Edit click
    $('#categories-table').on('click', '.edit-cat-btn', function () {
      const id = $(this).data('id');
      const rowData = catTable.row($(this).parents('tr')).data();
      $('#edit-category-id').val(rowData.id);
      $('#edit-category-name').val(rowData.name);
      $('#edit-category-desc').val(rowData.description || '');
      $('#editCategoryModal').modal('show');
    });

    // Form submit: Edit Category
    $('#edit-category-form').on('submit', function (e) {
      e.preventDefault();
      const id = $('#edit-category-id').val();
      const data = {
        name: $('#edit-category-name').val().trim(),
        description: $('#edit-category-desc').val().trim()
      };

      apiClient.editCategory(id, data).then(res => {
        apiClient.showToast('Category details updated!');
        $('#editCategoryModal').modal('hide');
        loadCategories();
      });
    });
  }

  // ==========================================
  // PAGE 4: ASSET MASTER
  // ==========================================
  if ($('#assets-table').length > 0) {
    const assetsTable = $('#assets-table').DataTable({
      columns: [
        { data: 'assetCode' },
        { data: 'serialNumber' },
        { data: 'category.name' },
        { 
          data: null,
          render: function(data) {
            return `<span class="fw-semibold">${data.make}</span> <span class="text-muted">${data.model}</span>`;
          }
        },
        { 
          data: 'value',
          className: 'text-end',
          render: function(val) { return formatCurrency(val); }
        },
        { data: 'branch' },
        { 
          data: 'status',
          render: function(status) {
            let cls = 'badge-in-stock';
            if (status === 'Issued') cls = 'badge-issued';
            if (status === 'Scraped') cls = 'badge-scraped';
            return `<span class="badge-status ${cls}">${status}</span>`;
          }
        },
        { 
          data: null,
          render: function(data) {
            if (data.status === 'Issued' && data.currentEmployee) {
              return `<span class="fw-bold"><i class="fa-solid fa-user text-muted me-1"></i>${data.currentEmployee.name}</span> <small class="text-muted">(${data.currentEmployee.employeeCode})</small>`;
            }
            if (data.status === 'Scraped') {
              return `<span class="text-danger fw-bold"><i class="fa-solid fa-circle-minus me-1"></i>Scraped</span>`;
            }
            return `<span class="text-success"><i class="fa-solid fa-circle-check me-1"></i>In Stock</span>`;
          }
        },
        {
          data: null,
          className: 'text-center',
          orderable: false,
          render: function(data) {
            // Disabled if scraped
            if (data.status === 'Scraped') {
              return `<button class="btn btn-sm btn-outline-secondary" disabled><i class="fa-solid fa-ban"></i> Locked</button>`;
            }
            return `
              <button class="btn btn-sm btn-outline-warning edit-asset-btn" data-id="${data.id}" title="Edit Asset">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
            `;
          }
        }
      ]
    });

    // Populate category dropdown filters
    apiClient.getAllCategories().then(categories => {
      const selectFilter = $('#asset-category-filter');
      const selectAdd = $('.asset-category-select');

      categories.forEach(cat => {
        selectFilter.append(`<option value="${cat.id}">${cat.name}</option>`);
        selectAdd.append(`<option value="${cat.id}">${cat.name}</option>`);
      });
    });

    function loadAssets() {
      const catId = $('#asset-category-filter').val();
      apiClient.getAllAssets(catId, '', false).then(assets => {
        assetsTable.clear().rows.add(assets).draw();
      });
    }

    loadAssets();

    // Category filter change
    $('#asset-category-filter').change(loadAssets);

    // Form submit: Add Asset
    $('#add-asset-form').on('submit', function (e) {
      e.preventDefault();
      const data = {
        assetCode: $('#add-asset-code').val().trim(),
        serialNumber: $('#add-serial').val().trim(),
        categoryId: parseInt($('#add-asset-category').val()),
        make: $('#add-make').val().trim(),
        model: $('#add-model').val().trim(),
        purchaseDate: $('#add-purchase-date').val(),
        value: parseFloat($('#add-value').val()),
        branch: $('#add-asset-branch').val()
      };

      apiClient.addNewAsset(data).then(res => {
        apiClient.showToast('Asset registered successfully!');
        $('#addAssetModal').modal('hide');
        $('#add-asset-form')[0].reset();
        // Reset default date picker
        $('#add-purchase-date').val(new Date().toISOString().substring(0, 10));
        loadAssets();
      });
    });

    // Edit asset button click
    $('#assets-table').on('click', '.edit-asset-btn', function () {
      const id = $(this).data('id');
      apiClient.getSingleAssetDetails(id).then(asset => {
        $('#edit-asset-id').val(asset.id);
        $('#edit-asset-code').val(asset.assetCode);
        $('#edit-serial').val(asset.serialNumber);
        $('#edit-asset-category').val(asset.categoryId);
        $('#edit-make').val(asset.make);
        $('#edit-model').val(asset.model);
        $('#edit-purchase-date').val(asset.purchaseDate);
        $('#edit-value').val(asset.value);
        $('#edit-asset-branch').val(asset.branch);
        $('#editAssetModal').modal('show');
      });
    });

    // Form submit: Edit Asset
    $('#edit-asset-form').on('submit', function (e) {
      e.preventDefault();
      const id = $('#edit-asset-id').val();
      const data = {
        assetCode: $('#edit-asset-code').val().trim(),
        serialNumber: $('#edit-serial').val().trim(),
        categoryId: parseInt($('#edit-asset-category').val()),
        make: $('#edit-make').val().trim(),
        model: $('#edit-model').val().trim(),
        purchaseDate: $('#edit-purchase-date').val(),
        value: parseFloat($('#edit-value').val()),
        branch: $('#edit-asset-branch').val()
      };

      apiClient.updateAssetDetails(id, data).then(res => {
        apiClient.showToast('Asset details updated!');
        $('#editAssetModal').modal('hide');
        loadAssets();
      });
    });
  }

  // ==========================================
  // OPERATIONS: ISSUE ASSET
  // ==========================================
  if ($('#issue-asset-form').length > 0) {
    // 1. Load available assets
    apiClient.getInStockAssets().then(assets => {
      const select = $('#issue-asset-select');
      select.empty();

      if (assets.length === 0) {
        select.append('<option value="" disabled selected>No assets currently in stock</option>');
      } else {
        select.append('<option value="" disabled selected>Choose an asset to allocate...</option>');
        assets.forEach(asset => {
          select.append(`<option value="${asset.id}">${asset.assetCode} - ${asset.make} ${asset.model} (SN: ${asset.serialNumber}) [${asset.branch}]</option>`);
        });
      }
    });

    // 2. Load active employees
    apiClient.getAllEmployees('Active').then(employees => {
      const select = $('#issue-employee-select');
      select.empty();

      if (employees.length === 0) {
        select.append('<option value="" disabled selected>No active employees found</option>');
      } else {
        select.append('<option value="" disabled selected>Choose an employee...</option>');
        employees.forEach(emp => {
          select.append(`<option value="${emp.id}">${emp.name} (${emp.employeeCode}) - ${emp.branch}</option>`);
        });
      }
    });

    // Submit form
    $('#issue-asset-form').on('submit', function (e) {
      e.preventDefault();
      const data = {
        assetId: parseInt($('#issue-asset-select').val()),
        employeeId: parseInt($('#issue-employee-select').val()),
        notes: $('#issue-notes').val().trim() || undefined
      };

      apiClient.allocateAssetToEmployee(data).then(res => {
        apiClient.showToast('Asset issued successfully!');
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      });
    });
  }

  // ==========================================
  // OPERATIONS: RETURN ASSET
  // ==========================================
  if ($('#return-asset-form').length > 0) {
    // Load issued assets
    apiClient.getAllAssets('', '', false).then(assets => {
      const select = $('#return-asset-select');
      select.empty();

      // Filter only issued assets
      const issuedAssets = assets.filter(a => a.status === 'Issued');

      if (issuedAssets.length === 0) {
        select.append('<option value="" disabled selected>No assets are currently issued</option>');
      } else {
        select.append('<option value="" disabled selected>Choose an asset to return...</option>');
        issuedAssets.forEach(asset => {
          const holderName = asset.currentEmployee ? asset.currentEmployee.name : 'Unknown';
          select.append(`<option value="${asset.id}">${asset.assetCode} - ${asset.make} ${asset.model} (SN: ${asset.serialNumber}) [Issued to: ${holderName}]</option>`);
        });
      }
    });

    // Submit form
    $('#return-asset-form').on('submit', function (e) {
      e.preventDefault();
      const data = {
        assetId: parseInt($('#return-asset-select').val()),
        reason: $('#return-reason').val(),
        notes: $('#return-notes').val().trim() || undefined
      };

      apiClient.returnAssetToStock(data).then(res => {
        apiClient.showToast('Asset successfully returned to stock!');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      });
    });
  }

  // ==========================================
  // OPERATIONS: SCRAP ASSET
  // ==========================================
  if ($('#scrap-asset-form').length > 0) {
    // Load all non-scraped assets
    apiClient.getAllAssets('', '', false).then(assets => {
      const select = $('#scrap-asset-select');
      select.empty();

      if (assets.length === 0) {
        select.append('<option value="" disabled selected>No assets registered</option>');
      } else {
        select.append('<option value="" disabled selected>Choose an asset to scrap...</option>');
        assets.forEach(asset => {
          select.append(`<option value="${asset.id}">${asset.assetCode} - ${asset.make} ${asset.model} (SN: ${asset.serialNumber}) [Status: ${asset.status}]</option>`);
        });
      }
    });

    // Submit form
    $('#scrap-asset-form').on('submit', function (e) {
      e.preventDefault();
      const data = {
        assetId: parseInt($('#scrap-asset-select').val()),
        reason: $('#scrap-reason').val(),
        notes: $('#scrap-notes').val().trim() || undefined
      };

      apiClient.scrapAssetObsolete(data).then(res => {
        apiClient.showToast('Asset successfully retired & scraped!');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      });
    });
  }

  // ==========================================
  // PAGE 8: ASSET HISTORY
  // ==========================================
  if ($('#search-history-form').length > 0) {
    // Load all assets (including scraped) to populate dropdown
    apiClient.getAllAssets('', '', true).then(assets => {
      const select = $('#history-asset-select');
      select.empty();

      if (assets.length === 0) {
        select.append('<option value="" disabled selected>No assets found in database</option>');
      } else {
        select.append('<option value="" disabled selected>Choose an asset...</option>');
        assets.forEach(asset => {
          let suffix = '';
          if (asset.status === 'Scraped') suffix = ' [SCRAP/Decommissioned]';
          if (asset.status === 'Issued') suffix = ` [Issued to ${asset.currentEmployee ? asset.currentEmployee.name : 'unknown'}]`;
          select.append(`<option value="${asset.id}">${asset.assetCode} - ${asset.make} ${asset.model} (SN: ${asset.serialNumber})${suffix}</option>`);
        });
      }
    });

    // Form submit: load history
    $('#search-history-form').on('submit', function (e) {
      e.preventDefault();
      const assetId = $('#history-asset-select').val();
      if (!assetId) return;

      // 1. Fetch asset details
      apiClient.getSingleAssetDetails(assetId).then(asset => {
        // Show asset details panel
        $('#info-code').text(asset.assetCode);
        $('#info-serial').text(asset.serialNumber);
        $('#info-category').text(asset.category ? asset.category.name : 'Unknown');
        $('#info-model').text(`${asset.make} ${asset.model}`);
        
        let statusBadge = '';
        if (asset.status === 'In Stock') statusBadge = '<span class="badge-status badge-in-stock">In Stock</span>';
        else if (asset.status === 'Issued') statusBadge = '<span class="badge-status badge-issued">Issued</span>';
        else statusBadge = '<span class="badge-status badge-scraped">Scraped / Decommissioned</span>';
        $('#info-status').html(statusBadge);

        $('#history-asset-info').removeClass('d-none');

        // 2. Fetch and render history timeline
        renderTimeline(asset.history);
      });
    });

    function renderTimeline(historyList) {
      const container = $('#timeline-container');
      const emptyState = $('#timeline-empty');

      container.empty();

      if (!historyList || historyList.length === 0) {
        container.addClass('d-none');
        emptyState.removeClass('d-none').html(`
          <i class="fa-solid fa-circle-exclamation fa-3x text-gray-300 mb-3"></i>
          <h6 class="text-muted">No operational history logs found for this asset.</h6>
        `);
        return;
      }

      emptyState.addClass('d-none');
      container.removeClass('d-none');

      historyList.forEach(item => {
        let markerClass = 'timeline-item-purchase';
        let actionBadgeColor = 'bg-primary';
        let actionIcon = 'fa-cart-shopping';
        let detailHtml = '';

        if (item.actionType === 'Issue') {
          markerClass = 'timeline-item-issue';
          actionBadgeColor = 'bg-warning text-dark';
          actionIcon = 'fa-handshake';
          const empName = item.employee ? item.employee.name : 'Unknown';
          const empCode = item.employee ? item.employee.employeeCode : '--';
          detailHtml = `<div><strong>Allocated to:</strong> ${empName} (${empCode})</div>`;
        } else if (item.actionType === 'Return') {
          markerClass = 'timeline-item-return';
          actionBadgeColor = 'bg-success';
          actionIcon = 'fa-arrow-right-to-bracket';
          const empName = item.employee ? item.employee.name : 'Unknown';
          const returnReason = item.reason ? item.reason.toUpperCase() : 'GENERAL RETURN';
          detailHtml = `
            <div><strong>Returned by:</strong> ${empName}</div>
            <div><strong>Reason:</strong> <span class="badge bg-secondary">${returnReason}</span></div>
          `;
        } else if (item.actionType === 'Scrap') {
          markerClass = 'timeline-item-scrap';
          actionBadgeColor = 'bg-danger';
          actionIcon = 'fa-trash-can';
          const scrapReason = item.reason ? item.reason.toUpperCase() : 'OBSOLETE';
          detailHtml = `
            <div><strong>Scrap Category:</strong> <span class="badge bg-danger">${scrapReason}</span></div>
          `;
        } else {
          // Purchase
          detailHtml = `<div><strong>Action:</strong> Initial hardware procurement entry</div>`;
        }

        const notes = item.notes ? `<div class="mt-2 text-muted italic">"<small>${item.notes}</small>"</div>` : '';

        container.append(`
          <div class="timeline-item ${markerClass}">
            <div class="timeline-date">${formatDateTime(item.actionDate)}</div>
            <div class="timeline-title d-flex align-items-center">
              <span class="badge ${actionBadgeColor} me-2">
                <i class="fa-solid ${actionIcon} me-1"></i>${item.actionType}
              </span>
              <span>Asset Update</span>
            </div>
            <div class="timeline-body">
              ${detailHtml}
              ${notes}
            </div>
          </div>
        `);
      });
    }
  }
});
