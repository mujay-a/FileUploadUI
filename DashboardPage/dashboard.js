if (localStorage.getItem("isLoggedIn") !== "true") {
    // Redirect to login page
    window.location.href = "./../LoginPage/index.html";
}

document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');
    if (username) {
      console.log(username, "username");
      document.getElementById('username').textContent = username;
    }
    fetchAllFiles(1); // Start with first page
fetchActiveUser();
    const uploadMenuItem = document.querySelector('.uploadside');
    const newUploadBtn = document.querySelector('.upload-btn');
    const uploadModal = document.getElementById('upload-modal');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const fileInput = document.getElementById('file-input');
    const dropArea = document.getElementById('drop-area');
    const fileInfo = document.getElementById('file-info');
    const fileDetails = document.getElementById('file-details');
    const submitBtn = document.getElementById('submit-btn');
    const spinnerOverlay = document.getElementById('spinner-overlay');
    const fileNameText = document.getElementById('file-name-text'); // Optional
    const toast = document.getElementById('toast'); // Optional if you want toast
    const activityTable = document.querySelector('.activity-table');

    const logoutMenuItem = document.querySelector('.logout');
    
    // Add click event listener
    logoutMenuItem.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent the default anchor behavior
        
        // Clear all items in localStorage
        localStorage.clear();
        
        // Alternative: If you only want to clear the login status
        // localStorage.removeItem("isLoggedIn");
        
        // Redirect to login page
        window.location.href = "./../LoginPage/index.html";
    });

    if (activityTable) {
        activityTable.style.height = '50%';
        activityTable.style.overflowY = 'auto';
    }
    let selectedFile = null;

    uploadMenuItem?.addEventListener('click', openModal);
    newUploadBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);

    window.addEventListener('click', function (e) {
        if (e.target === uploadModal) {
            closeModal();
        }
    });

    fileInput?.addEventListener('change', function (e) {
        handleFile(e.target.files[0]);
    });

    // Drag and drop support
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        dropArea?.addEventListener(event, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(event => {
        dropArea?.addEventListener(event, () => dropArea.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(event => {
        dropArea?.addEventListener(event, () => dropArea.classList.remove('dragover'), false);
    });

    dropArea?.addEventListener('drop', function (e) {
        const dt = e.dataTransfer;
        handleFile(dt.files[0]);
    });

    submitBtn?.addEventListener('click', function () {
        if (selectedFile) {
            uploadFile(selectedFile);
        }
    });

    function openModal(e) {
        e.preventDefault();
        uploadModal.style.display = 'flex';
        resetForm();
    }

    function closeModal() {
        uploadModal.style.display = 'none';
        resetForm();
    }

    function resetForm() {
        fileInput.value = '';
        fileInfo.style.display = 'none';
        fileDetails.textContent = 'No file selected';
        selectedFile = null;
        submitBtn.disabled = true;
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleFile(file) {
        if (file) {
            selectedFile = file;
            fileInfo.style.display = 'block';
            fileDetails.textContent = `${file.name} (${formatFileSize(file.size)})`;
            if (fileNameText) fileNameText.textContent = file.name;
            submitBtn.disabled = false;
        }
    }

    function formatFileSize(bytes) {
        const units = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
    }

    function uploadFile(file) {
        const API_URL = "https://localhost:7202/api/FileUpload/uploadSingleFile";
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", API_URL, true);

        spinnerOverlay.style.display = "flex";

        xhr.onload = function () {
            spinnerOverlay.style.display = "none";

            if (xhr.status === 200) {
                swal("Done!", "File Uploaded Successfully!", "success");
                if (fileNameText) fileNameText.textContent = "";
                fileInput.value = "";
                closeModal();
            } else {
                swal("Oops!", "Upload failed. Please try again!", "error");
            }
        };

        xhr.onerror = function () {
            spinnerOverlay.style.display = "none";
            alert("Upload error. Check your connection.");
        };

        xhr.send(formData);
    }
});
function fetchActiveUser() {
    const API_URL = "https://localhost:7202/api/Auth/ActiveUsers";
    const userNameElement = document.querySelector('.active-user');
    
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch active user.");
            }
            return response.json();
        })
        .then(data => {
            // Assuming the API returns an object with a count or number property
            // Update the stat-value element with the value from the response
            if (data && data.count !== undefined) {
                userNameElement.textContent = data.count;
            } else if (typeof data === 'number') {
                userNameElement.textContent = data;
            } else {
                // If data structure is different, handle accordingly
                // This fallback assumes the API returns the count directly as a value
                userNameElement.textContent = JSON.stringify(data);
            }
        })
        .catch(error => {
            console.error("Error fetching active users:", error);
            userNameElement.textContent = "Error";
        });
}
let currentPage = 1;
let totalPages = 1;
let itemsPerPage = 5;
let allFiles = [];

function fetchAllFiles(page) {
    const API_URL = "https://localhost:7202/api/FileUpload/GetAll";
    const tbody = document.querySelector('.activity-table tbody');
    const paginationContainer = document.getElementById('pagination-container') || createPaginationContainer();

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch files.");
            }
            return response.json();
        })
        .then(files => {
            // Store all files globally
            allFiles = files;
            
            // Calculate total pages
            totalPages = Math.ceil(files.length / itemsPerPage);
            
            // Get current page data
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentPageData = files.slice(startIndex, endIndex);
            
            // Clear old rows
            tbody.innerHTML = '';

            // Create table rows from current page data
            currentPageData.forEach(file => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td class="file-name">
                        <span class="file-name-text">${file.fileName || 'N/A'}</span>
                    </td>
                    <td class="file-size">
                        <a class="status-badge" href="${file.fileUrl}" download target="_blank">Download</a>
                    </td>
                    <td>${formatDate(file.uploadDate)}</td>
                    <td><span class="status-badge">Complete</span></td>
                `;

                tbody.appendChild(row);
            });
            
            // Update pagination
            updatePagination(page, totalPages);
        })
        .catch(error => {
            console.error("Error loading files:", error);
        });
}

function createPaginationContainer() {
    // Create pagination container if it doesn't exist
    const container = document.createElement('div');
    container.id = 'pagination-container';
    container.className = 'pagination';
    
    // Add styles to the container
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.margin = '20px 0';
    container.style.gap = '10px';
    
    // Insert after table
    const tableContainer = document.querySelector('.modal').parentNode;
    tableContainer.insertBefore(container, document.querySelector('.modal').nextSibling);
    
    return container;
}

function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'pagination-btn';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            fetchAllFiles(currentPage - 1);
        }
    });
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'pagination-btn';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            fetchAllFiles(currentPage + 1);
        }
    });
    
    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    pageInfo.style.margin = '0 10px';
    pageInfo.style.alignSelf = 'center';
    
    // Add to container
    paginationContainer.appendChild(prevButton);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextButton);
    
    // Add some basic button styles
    const buttons = paginationContainer.querySelectorAll('.pagination-btn');
    buttons.forEach(btn => {
        btn.style.padding = '8px 12px';
        btn.style.border = '1px solid #ddd';
        btn.style.borderRadius = '4px';
        btn.style.background = '#f5f5f5';
        btn.style.cursor = 'pointer';
        
        // Disable styling
        if (btn.disabled) {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        }
        
        // Hover effect
        btn.addEventListener('mouseover', function() {
            if (!this.disabled) {
                this.style.background = '#e0e0e0';
            }
        });
        
        btn.addEventListener('mouseout', function() {
            if (!this.disabled) {
                this.style.background = '#f5f5f5';
            }
        });
    });
}

//<td class="user-column">${file.uploadedBy || 'Unknown'}</td>
//<td class="action-upload">Upload</td>

// Format bytes to human-readable size
function formatFileSize(bytes) {
    const units = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
}

// Format date into readable format
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');        // 01 to 31
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 01 to 12
    const year = date.getFullYear();                            // 2025, etc.
    return `${day}-${month}-${year}`;
}

// Restrict access if not logged in
