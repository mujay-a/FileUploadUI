if (localStorage.getItem("isLoggedIn") !== "true") {
  // Redirect to login page
  window.location.href = "./../LoginPage/index.html";
}

document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const username = localStorage.getItem('username');
  if (username) {
    console.log(username, "username");
    document.getElementById('username').textContent = username;
  }

  const dropArea = document.getElementById('dropArea');
  const browseBtn = document.getElementById('browseBtn');
  const fileInput = document.getElementById('fileInput');
  const categoryContainer = document.getElementById('categoryContainer');
  const keywordInput = document.getElementById('keywordInput');
  const filesList = document.getElementById('filesList');
  const filesContainer = document.getElementById('filesContainer');
  const completeBtn = document.getElementById('completeBtn');
  const errorMessage = document.getElementById('errorMessage');
  const spinnerOverlay = document.getElementById('spinner-overlay');
  
  // Files storage
  let uploadedFiles = [];
  
  // Event listeners for drag and drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight() {
    dropArea.classList.add('dragover');
  }
  
  function unhighlight() {
    dropArea.classList.remove('dragover');
  }
  
  dropArea.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }
  
  // Browse button click
  browseBtn.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
  });
  
  function handleFiles(files) {
    // Clear previous files
    uploadedFiles = [];
    filesContainer.innerHTML = '';
    
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      const fileObj = {
        file: file,
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        progress: 0,
        uploaded: false
      };
      
      uploadedFiles.push(fileObj);
      addFileToList(fileObj);
      simulateUpload(fileObj.id);
    });
    
    if (uploadedFiles.length > 0) {
      filesList.style.display = 'block';
      updateCompleteButtonState();
    }
  }
  
  function addFileToList(fileObj) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.id = fileObj.id;
    
    const fileSize = (fileObj.file.size / 1024).toFixed(2);
    
    fileItem.innerHTML = `
      <div class="file-item-header">
        <div class="file-info">
          <div class="file-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <div class="file-name">${fileObj.file.name}</div>
            <div class="file-size">${fileSize} KB</div>
          </div>
        </div>
        <div class="file-actions">
          <div class="file-status status-uploading">
            <span class="status-text">${fileObj.progress}%</span>
          </div>
          <button class="remove-btn" data-id="${fileObj.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress" style="width: ${fileObj.progress}%"></div>
      </div>
    `;
    
    filesContainer.appendChild(fileItem);
    
    // Add event listener to remove button
    const removeBtn = fileItem.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => {
      removeFile(fileObj.id);
    });
  }
  
  function updateFileProgress(fileId, progress) {
    const fileItem = document.querySelector(`.file-item[data-id="${fileId}"]`);
    if (fileItem) {
      const progressBar = fileItem.querySelector('.progress');
      const statusText = fileItem.querySelector('.status-text');
      
      progressBar.style.width = `${progress}%`;
      statusText.textContent = `${progress}%`;
      
      if (progress === 100) {
        const statusEl = fileItem.querySelector('.file-status');
        statusEl.classList.remove('status-uploading');
        statusEl.classList.add('status-complete');
        statusEl.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Uploaded</span>
        `;
      }
    }
  }
  
  // Helper function to get selected category
  const selectedCategory = () => {
    const cat = categoryContainer.querySelector('select');
    return cat ? cat.value : 'default';
  };
  
  // Complete button click event
  completeBtn.addEventListener('click', () => {
    errorMessage.textContent = ''; // Clear old error
    const keyword = keywordInput.value.trim();
    const category = selectedCategory();
    
    if (uploadedFiles.length === 0) {
      errorMessage.textContent = 'Please select a file to upload.';
      return;
    }
    
    // Validate all files
    const invalidFile = uploadedFiles.find(fileObj => fileObj.file.type !== 'application/pdf');
    if (invalidFile) {
      errorMessage.textContent = 'Please select PDF file only.';
      return;
    }
    
    // Disable button and show spinner to prevent multiple clicks
    completeBtn.disabled = true;
    if (spinnerOverlay) {
      spinnerOverlay.style.display = 'flex';
    }
    
    // Create a new FormData object
    const formData = new FormData();
    
    // Append only the first file
    formData.append('File', uploadedFiles[0].file);
    
    // Append other data
    formData.append('GroupName', category);
    formData.append('Keyword', keyword);
    
    // Make a single API call
    fetch('https://localhost:7202/api/FileUpload/Upload', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    })
    .then(data => {
      console.log('Upload success:', data);
      
      // Use SweetAlert for success notification
      swal({
        title: "Success!",
        text: "File uploaded successfully!",
        icon: "success",
        button: "OK",
      });
      
      // Clear the file list after successful upload
      uploadedFiles = [];
      filesContainer.innerHTML = '';
      filesList.style.display = 'none';
      keywordInput.value = '';
      
      // Reset the category dropdown if needed
      const categorySelect = categoryContainer.querySelector('select');
      if (categorySelect) {
        categorySelect.selectedIndex = 0;
      }
    })
    .catch(error => {
      console.error('Upload error:', error);
      
      // Use SweetAlert for error notification
      swal({
        title: "Upload Failed",
        text: "There was a problem uploading your file.",
        icon: "error",
        button: "Try Again",
      });
      
      errorMessage.textContent = 'Failed to upload file.';
    })
    .finally(() => {
      // Re-enable the button and hide spinner
      completeBtn.disabled = false;
      if (spinnerOverlay) {
        spinnerOverlay.style.display = 'none';
      }
    });
  });
  
  function simulateUpload(fileId) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Update file object
        const fileIndex = uploadedFiles.findIndex(f => f.id === fileId);
        if (fileIndex !== -1) {
          uploadedFiles[fileIndex].progress = progress;
          uploadedFiles[fileIndex].uploaded = true;
          updateCompleteButtonState();
        }
      }
      
      // Update file object
      const fileIndex = uploadedFiles.findIndex(f => f.id === fileId);
      if (fileIndex !== -1) {
        uploadedFiles[fileIndex].progress = progress;
      }
      
      updateFileProgress(fileId, progress);
    }, 300);
  }
  
  function removeFile(fileId) {
    // Remove from DOM
    const fileItem = document.querySelector(`.file-item[data-id="${fileId}"]`);
    if (fileItem) {
      fileItem.remove();
    }
    
    // Remove from array
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
    
    // Hide files list if empty
    if (uploadedFiles.length === 0) {
      filesList.style.display = 'none';
    }
    
    updateCompleteButtonState();
  }
  
  function updateCompleteButtonState() {
    const allUploaded = uploadedFiles.length > 0 && uploadedFiles.every(f => f.uploaded);
    completeBtn.disabled = !allUploaded;
  }
  
  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://localhost:7202/api/FileUpload/ListGroup');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || []; // Return the full array from the API
    } catch (error) {
      console.error('Error fetching categories:', error);
      return []; // Return empty array in case of error
    }
  };
  
  // Initialize the category dropdown
  const initializeCategoryDropdown = async () => {
    try {
      // Fetch categories from the API
      const categories = await fetchCategories();
      
      // Create and populate select element
      const select = document.createElement('select');
      select.className = 'form-select';
      
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select a category';
      select.appendChild(defaultOption);
      
      // Add each category as an option
      categories.forEach(item => {
        const option = document.createElement('option');
        option.value = item.group1;
        option.textContent = item.group1;
        select.appendChild(option);
      });
      
      // Replace loading container with select
      categoryContainer.innerHTML = '';
      categoryContainer.appendChild(select);
    } catch (error) {
      // Handle any errors
      categoryContainer.innerHTML = '<div class="alert alert-danger">Failed to load categories</div>';
      console.error('Error initializing dropdown:', error);
    }
  };
  
  // Call the initialization function with a slight delay to show the loading animation
  setTimeout(() => {
    initializeCategoryDropdown();
  }, 1500);
  
  // Add event handlers for sidebar navigation if needed
  const logoutBtn = document.querySelector('.logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
          // Clear all items in localStorage
          localStorage.clear();
        
          // Alternative: If you only want to clear the login status
          // localStorage.removeItem("isLoggedIn");
      // Handle logout functionality
      window.location.href = './../LoginPage/index.html';
    });
  }
  
  const uploadSideBtn = document.querySelector('.uploadside');
  if (uploadSideBtn) {
    uploadSideBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // You're already on the upload page
    });
  }
});